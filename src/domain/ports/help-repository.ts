/**
 * HelpRepository port — support-ticket intake (used by the public help form,
 * so the implementation writes with a privileged client).
 */
export interface HelpMessageInput {
  name: string;
  email: string;
  subject: string;
  body: string;
  userId: string | null;
}

export interface HelpRepository {
  createMessage(input: HelpMessageInput): Promise<{ id: string }>;
}