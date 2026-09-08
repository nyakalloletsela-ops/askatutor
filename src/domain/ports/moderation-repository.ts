/**
 * ModerationRepository port — community forum post creation.
 */
export interface ForumPostInput {
  userId: string;
  title: string | null;
  body: string;
  subject: string | null;
  parentId: string | null;
}

export interface ModerationRepository {
  createPost(input: ForumPostInput): Promise<void>;
}