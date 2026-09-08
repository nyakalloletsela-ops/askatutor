/**
 * MessageRepository port — direct (1:1) messaging between users.
 */
export interface DirectMessageInput {
  senderId: string;
  recipientId: string;
  body: string;
}

export interface MessageRepository {
  send(message: DirectMessageInput): Promise<void>;
}