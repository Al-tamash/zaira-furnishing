// src/lib/notifications/types.ts

export interface NotificationPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: string;
}

export interface NotificationProvider {
  name: string;
  send(payload: NotificationPayload): Promise<NotificationResult>;
}
