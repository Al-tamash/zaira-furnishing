// src/lib/notifications/provider.ts

import { NotificationPayload, NotificationResult, NotificationProvider } from './types';

/**
 * Production-ready notification provider abstraction for Zaira Furnishing.
 *
 * Configured via environment variables:
 * - NOTIFICATION_PROVIDER_API_KEY: Secret API key for delivery provider
 * - NOTIFICATION_FROM_EMAIL: Sender address (e.g. "Zaira Furnishing <orders@zairafurnishing.com>")
 * - NOTIFICATION_ADMIN_EMAIL: Admin recipient address (e.g. "concierge@zairafurnishing.com")
 * - NOTIFICATION_MOCK_SUCCESS: "true" for testing success code paths safely without external credentials
 */
export class DefaultNotificationProvider implements NotificationProvider {
  name = 'resend-generic';

  private getApiKey(): string | undefined {
    return process.env.NOTIFICATION_PROVIDER_API_KEY?.trim() || undefined;
  }

  getFromEmail(): string {
    return (
      process.env.NOTIFICATION_FROM_EMAIL?.trim() ||
      'Zaira Furnishing <orders@zairafurnishing.com>'
    );
  }

  getAdminEmail(): string {
    return (
      process.env.NOTIFICATION_ADMIN_EMAIL?.trim() ||
      process.env.ADMIN_NOTIFICATION_EMAIL?.trim() ||
      'concierge@zairafurnishing.com'
    );
  }

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    // 1. Check for mock/testing override in local test suites
    if (
      process.env.NOTIFICATION_MOCK_SUCCESS === 'true' ||
      (process.env.NODE_ENV !== 'production' && payload.metadata?.mockSuccess === true)
    ) {
      const mockId = `mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      return {
        success: true,
        messageId: mockId,
        provider: 'mock-delivery',
      };
    }

    const apiKey = this.getApiKey();

    // 2. If provider is not configured, record as unconfigured failure (never fake delivery)
    if (!apiKey) {
      return {
        success: false,
        error: 'Delivery provider not configured: missing provider credentials in environment.',
        provider: 'unconfigured',
      };
    }

    const fromEmail = this.getFromEmail();

    // 3. Resend REST API integration (standard modern email provider)
    try {
      const isResend = apiKey.startsWith('re_');
      const endpoint = isResend
        ? 'https://api.resend.com/emails'
        : 'https://api.resend.com/emails';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [payload.to],
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
          headers: {
            'X-Entity-Ref-ID': payload.metadata?.orderId as string || undefined,
          },
        }),
      });

      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        return {
          success: false,
          error: `Provider HTTP ${res.status}: ${errBody || res.statusText}`,
          provider: isResend ? 'resend' : 'generic-http',
        };
      }

      const resData = await res.json().catch(() => ({}));
      const messageId = resData?.id || `msg_${Date.now()}`;

      return {
        success: true,
        messageId,
        provider: isResend ? 'resend' : 'generic-http',
      };
    } catch (err: any) {
      return {
        success: false,
        error: `Provider transport error: ${err.message || 'Network failure'}`,
        provider: 'generic-http',
      };
    }
  }
}

// Global provider instance (can be overridden in tests via setNotificationProvider)
let currentProvider: NotificationProvider = new DefaultNotificationProvider();

export function getNotificationProvider(): NotificationProvider {
  return currentProvider;
}

export function setNotificationProvider(provider: NotificationProvider): void {
  currentProvider = provider;
}
