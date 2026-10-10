import path from 'path';
import fs from 'fs';
import os from 'os';
import { CORE_SCHEMA_DDL, ensureDatabaseSchema } from './auto-migrate';

export interface BatchStatement {
  sql: string;
  params?: unknown[];
}

export interface DatabaseHealth {
  ok: boolean;
  provider: 'd1' | 'sqlite';
  latencyMs: number;
  tablesCount?: number;
  error?: string;
}

export interface DatabaseClient {
  query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
  queryOne<T = unknown>(sql: string, params?: unknown[]): Promise<T | null>;
  execute(sql: string, params?: unknown[]): Promise<{ changes: number; lastInsertRowid?: number | bigint }>;
  batch(statements: BatchStatement[]): Promise<{ changes: number }[]>;
  runMigration(sql: string): Promise<void>;
  healthCheck(): Promise<DatabaseHealth>;
}

// ─── 1. Local Node.js SQLite Driver (Zero-dependency via node:sqlite in Node 22+) ───
class LocalSqliteClient implements DatabaseClient {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private db: any = null;

  private async getDb() {
    if (this.db) return this.db;

    // Dynamically import node:sqlite to ensure compatibility across runtime environments
    const { DatabaseSync } = await import('node:sqlite');

    // Detect serverless environments (e.g. Vercel, AWS Lambda) where process.cwd() is read-only
    const isServerless = Boolean(
      process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.LAMBDA_TASK_ROOT
    );

    const sourceDbDir = path.resolve(process.cwd(), 'data');
    const sourceDbPath = path.join(sourceDbDir, 'zaira.db');

    let activeDbPath = sourceDbPath;

    if (isServerless) {
      // In serverless, process.cwd() is read-only. Use os.tmpdir() for writable SQLite operations
      const tmpDbPath = path.join(os.tmpdir(), 'zaira.db');
      try {
        if (!fs.existsSync(tmpDbPath) && fs.existsSync(sourceDbPath)) {
          fs.copyFileSync(sourceDbPath, tmpDbPath);
        }
        activeDbPath = tmpDbPath;
      } catch (copyErr) {
        console.warn('[DATABASE WARNING] Could not copy seed database to tmp, trying source path:', copyErr);
        activeDbPath = sourceDbPath;
      }
    } else {
      if (!fs.existsSync(sourceDbDir)) {
        try {
          fs.mkdirSync(sourceDbDir, { recursive: true });
        } catch {
          activeDbPath = path.join(os.tmpdir(), 'zaira.db');
        }
      }
    }

    try {
      this.db = new DatabaseSync(activeDbPath);

      // Attempt journal mode configuration gracefully
      try {
        this.db.exec('PRAGMA journal_mode = WAL;');
      } catch {
        try {
          this.db.exec('PRAGMA journal_mode = DELETE;');
        } catch {
          // Ignored in read-only or restricted environments
        }
      }

      this.db.exec('PRAGMA foreign_keys = ON;');

      // Auto-initialize schema and catalog data if tables are missing
      try {
        const check = this.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='products'").get();
        if (!check) {
          console.log('[DATABASE] "products" table missing in ' + activeDbPath + '. Auto-initializing database schema...');
          let diskMigrationsRan = false;
          try {
            const migrationsDir = path.resolve(process.cwd(), 'migrations');
            if (fs.existsSync(migrationsDir)) {
              const files = fs
                .readdirSync(migrationsDir)
                .filter((f) => f.endsWith('.sql'))
                .sort();
              for (const file of files) {
                const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
                this.db.exec(sql);
              }
              diskMigrationsRan = true;
              console.log('[DATABASE] Successfully applied all disk migrations to ' + activeDbPath);
            }
          } catch (migErr) {
            console.warn('[DATABASE] Disk migrations notice, falling back to embedded schema:', migErr);
          }

          if (!diskMigrationsRan) {
            this.db.exec(CORE_SCHEMA_DDL);
            console.log('[DATABASE] Applied embedded CORE_SCHEMA_DDL to ' + activeDbPath);
          }
        }
      } catch (schemaErr) {
        console.warn('[DATABASE] Schema auto-migration check notice:', schemaErr);
      }
    } catch (openErr) {
      console.error('[DATABASE ERROR] Failed opening SQLite database at ' + activeDbPath + ':', openErr);
      throw openErr;
    }

    return this.db;
  }

  async query<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
    try {
      const db = await this.getDb();
      const stmt = db.prepare(sql);
      // Convert undefined to null and boolean params to 1/0 for SQLite compatibility
      const sanitize = (val: unknown) => {
        if (val === undefined) return null;
        if (typeof val === 'boolean') return val ? 1 : 0;
        return val;
      };
      const sanitizedParams = params.map(sanitize);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawRows = stmt.all(...sanitizedParams) as any[];
      return rawRows.map((row) => ({ ...row })) as T[];
    } catch (err: any) {
      if (err?.message && err.message.includes('no such table')) {
        console.warn('[DATABASE] "no such table" detected in query. Ensuring schema and retrying...');
        await ensureDatabaseSchema(this);
        const db = await this.getDb();
        const stmt = db.prepare(sql);
        const sanitize = (val: unknown) => {
          if (val === undefined) return null;
          if (typeof val === 'boolean') return val ? 1 : 0;
          return val;
        };
        const sanitizedParams = params.map(sanitize);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawRows = stmt.all(...sanitizedParams) as any[];
        return rawRows.map((row) => ({ ...row })) as T[];
      }
      throw err;
    }
  }

  async queryOne<T = unknown>(sql: string, params: unknown[] = []): Promise<T | null> {
    const results = await this.query<T>(sql, params);
    return results.length > 0 ? results[0] : null;
  }

  async execute(sql: string, params: unknown[] = []): Promise<{ changes: number; lastInsertRowid?: number | bigint }> {
    try {
      const db = await this.getDb();
      const stmt = db.prepare(sql);
      const sanitize = (val: unknown) => {
        if (val === undefined) return null;
        if (typeof val === 'boolean') return val ? 1 : 0;
        return val;
      };
      const sanitizedParams = params.map(sanitize);
      const result = stmt.run(...sanitizedParams);
      return {
        changes: result.changes,
        lastInsertRowid: result.lastInsertRowid,
      };
    } catch (err: any) {
      if (err?.message && err.message.includes('no such table')) {
        console.warn('[DATABASE] "no such table" detected in execute. Ensuring schema and retrying...');
        await ensureDatabaseSchema(this);
        const db = await this.getDb();
        const stmt = db.prepare(sql);
        const sanitize = (val: unknown) => {
          if (val === undefined) return null;
          if (typeof val === 'boolean') return val ? 1 : 0;
          return val;
        };
        const sanitizedParams = params.map(sanitize);
        const result = stmt.run(...sanitizedParams);
        return {
          changes: result.changes,
          lastInsertRowid: result.lastInsertRowid,
        };
      }
      throw err;
    }
  }

  async batch(statements: BatchStatement[]): Promise<{ changes: number }[]> {
    if (statements.length === 0) return [];
    try {
      const db = await this.getDb();
      db.exec('BEGIN TRANSACTION;');
      try {
        const results: { changes: number }[] = [];
        const sanitize = (val: unknown) => {
          if (val === undefined) return null;
          if (typeof val === 'boolean') return val ? 1 : 0;
          return val;
        };

        for (const s of statements) {
          const stmt = db.prepare(s.sql);
          const sanitizedParams = (s.params || []).map(sanitize);
          const result = stmt.run(...sanitizedParams);
          results.push({ changes: result.changes });
        }

        db.exec('COMMIT;');
        return results;
      } catch (err) {
        db.exec('ROLLBACK;');
        throw err;
      }
    } catch (err: any) {
      if (err?.message && err.message.includes('no such table')) {
        console.warn('[DATABASE] "no such table" detected in batch. Ensuring schema and retrying...');
        await ensureDatabaseSchema(this);
        return this.batch(statements);
      }
      throw err;
    }
  }

  async runMigration(sql: string): Promise<void> {
    const db = await this.getDb();
    db.exec(sql);
  }

  async healthCheck(): Promise<DatabaseHealth> {
    const start = Date.now();
    try {
      const rows = await this.query<{ ping: number }>('SELECT 1 as ping');
      const tableRows = await this.query<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type='table'"
      );
      return {
        ok: rows.length > 0 && rows[0].ping === 1,
        provider: 'sqlite',
        latencyMs: Date.now() - start,
        tablesCount: tableRows.length,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Local SQLite check failed';
      return {
        ok: false,
        provider: 'sqlite',
        latencyMs: Date.now() - start,
        error: errorMsg,
      };
    }
  }
}

// ─── 2. Cloudflare D1 Remote HTTP Client ───
class CloudflareD1HttpClient implements DatabaseClient {
  private accountId: string;
  private databaseId: string;
  private apiToken: string;
  private schemaVerified = false;
  private schemaInitPromise: Promise<boolean> | null = null;

  constructor(accountId: string, databaseId: string, apiToken: string) {
    this.accountId = accountId;
    this.databaseId = databaseId;
    this.apiToken = apiToken;
  }

  private async ensureSchemaChecked(): Promise<void> {
    if (this.schemaVerified) return;
    if (this.schemaInitPromise) {
      await this.schemaInitPromise;
      return;
    }
    this.schemaInitPromise = (async () => {
      try {
        await ensureDatabaseSchema(this);
        this.schemaVerified = true;
        return true;
      } catch (err) {
        console.warn('[CLOUDFLARE D1] Initial schema check warning:', err);
        return false;
      } finally {
        this.schemaInitPromise = null;
      }
    })();
    await this.schemaInitPromise;
  }

  private sanitizeParams(params: unknown[] = []): unknown[] {
    return params.map((val) => {
      if (val === undefined) return null;
      if (typeof val === 'boolean') return val ? 1 : 0;
      return val;
    });
  }

  private async rawQuery<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    const url = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/d1/database/${this.databaseId}/query`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sql,
        params: this.sanitizeParams(params),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Cloudflare D1 query failed: ${res.status} ${errText}`);
    }

    const data = await res.json();
    if (!data.success) {
      throw new Error(`Cloudflare D1 error: ${JSON.stringify(data.errors)}`);
    }

    return (data.result?.[0]?.results || []) as T[];
  }

  async query<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
    try {
      await this.ensureSchemaChecked();
      return await this.rawQuery<T>(sql, params);
    } catch (err: any) {
      if (err?.message && err.message.includes('no such table')) {
        console.warn('[CLOUDFLARE D1] "no such table" error. Running schema migration and retrying...');
        await ensureDatabaseSchema(this);
        return await this.rawQuery<T>(sql, params);
      }
      throw err;
    }
  }

  async queryOne<T = unknown>(sql: string, params: unknown[] = []): Promise<T | null> {
    const results = await this.query<T>(sql, params);
    return results.length > 0 ? results[0] : null;
  }

  async execute(sql: string, params: unknown[] = []): Promise<{ changes: number; lastInsertRowid?: number | bigint }> {
    const trimmed = sql.trim().toUpperCase();
    if (trimmed === 'BEGIN' || trimmed === 'BEGIN TRANSACTION' || trimmed === 'COMMIT' || trimmed === 'ROLLBACK') {
      return { changes: 0 };
    }

    try {
      await this.ensureSchemaChecked();
      const url = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/d1/database/${this.databaseId}/query`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sql,
          params: this.sanitizeParams(params),
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Cloudflare D1 execute failed: ${res.status} ${errText}`);
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error(`Cloudflare D1 execute error: ${JSON.stringify(data.errors)}`);
      }

      const meta = data.result?.[0]?.meta;
      return {
        changes: meta?.changes || 0,
        lastInsertRowid: meta?.last_row_id,
      };
    } catch (err: any) {
      if (err?.message && err.message.includes('no such table')) {
        console.warn('[CLOUDFLARE D1] "no such table" error on execute. Auto-migrating and retrying...');
        await ensureDatabaseSchema(this);
        return await this.execute(sql, params);
      }
      throw err;
    }
  }

  async batch(statements: BatchStatement[]): Promise<{ changes: number }[]> {
    if (statements.length === 0) return [];
    try {
      await this.ensureSchemaChecked();
      const url = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/d1/database/${this.databaseId}/query`;
      const payload = statements.map((s) => ({
        sql: s.sql,
        params: this.sanitizeParams(s.params),
      }));

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Cloudflare D1 batch failed: ${res.status} ${errText}`);
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error(`Cloudflare D1 batch error: ${JSON.stringify(data.errors)}`);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data.result || []).map((r: any) => ({
        changes: r?.meta?.changes || 0,
      }));
    } catch (err: any) {
      if (err?.message && err.message.includes('no such table')) {
        console.warn('[CLOUDFLARE D1] "no such table" error on batch. Auto-migrating and retrying...');
        await ensureDatabaseSchema(this);
        return await this.batch(statements);
      }
      throw err;
    }
  }

  async runMigration(sql: string): Promise<void> {
    // Strip single-line comments and split into individual statements
    const statements = sql
      .split('\n')
      .filter((line) => !line.trim().startsWith('--'))
      .join('\n')
      .split(';')
      .map((s) => s.trim())
      .filter((s) => {
        if (!s) return false;
        const upper = s.toUpperCase();
        return upper !== 'BEGIN TRANSACTION' && upper !== 'BEGIN' && upper !== 'COMMIT' && upper !== 'ROLLBACK';
      });

    for (const stmt of statements) {
      await this.execute(stmt);
    }
  }

  async healthCheck(): Promise<DatabaseHealth> {
    const start = Date.now();
    try {
      const rows = await this.query<{ ping: number }>('SELECT 1 as ping');
      const tableRows = await this.query<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type='table'"
      );
      return {
        ok: rows.length > 0 && rows[0].ping === 1,
        provider: 'd1',
        latencyMs: Date.now() - start,
        tablesCount: tableRows.length,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Cloudflare D1 connection failed';
      return {
        ok: false,
        provider: 'd1',
        latencyMs: Date.now() - start,
        error: errorMsg,
      };
    }
  }
}

// ─── Singleton Database Instance ───
let globalDb: DatabaseClient | null = null;

export function getDatabase(): DatabaseClient {
  if (globalDb) return globalDb;

  const isProduction = process.env.NODE_ENV === 'production';
  const forceLocal = process.env.USE_LOCAL_SQLITE === 'true';
  const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const cfDatabaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
  const cfApiToken = process.env.CLOUDFLARE_API_TOKEN;

  const hasD1Config = Boolean(cfAccountId && cfDatabaseId && cfApiToken);

  if (hasD1Config) {
    globalDb = new CloudflareD1HttpClient(cfAccountId!, cfDatabaseId!, cfApiToken!);
    return globalDb;
  }

  if (isProduction && !forceLocal) {
    const missingVars: string[] = [];
    if (!cfAccountId) missingVars.push('CLOUDFLARE_ACCOUNT_ID');
    if (!cfDatabaseId) missingVars.push('CLOUDFLARE_D1_DATABASE_ID');
    if (!cfApiToken) missingVars.push('CLOUDFLARE_API_TOKEN');

    console.warn(
      `[DATABASE NOTICE] Cloudflare D1 environment variables missing: ${missingVars.join(', ')}.\n` +
      `Falling back to SQLite client to ensure seamless availability.`
    );
  }

  // Local SQLite client fallback
  globalDb = new LocalSqliteClient();
  return globalDb;
}
