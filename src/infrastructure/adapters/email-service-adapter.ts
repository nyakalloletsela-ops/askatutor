import type {
  EmailService,
  SendEmailOptions,
} from "@/application/contracts/email";

/**
 * EmailService adapter — bridges the EmailService contract to the existing
 * email provider infrastructure.
 *
 * Maps from the contract's SendEmailOptions to the existing
 * sendTransactionalEmail payload used by @/lib/email/provider.server.
 */
export function createEmailService(): EmailService {
  return {
    async send(options: SendEmailOptions): Promise<void> {
      const { sendTransactionalEmail } = await import(
        "@/lib/email/provider.server"
      );

      // Contract sends to an array of recipients; the existing
      // infrastructure sends one email per recipient.
      for (const recipient of options.to) {
        await sendTransactionalEmail({
          templateName: options.template,
          recipientEmail: recipient,
          idempotencyKey: options.idempotencyKey ?? `${options.template}-${recipient}-${Date.now()}`,
          templateData: options.props,
          fromAlias: options.from,
        });
      }
    },
  };
}
