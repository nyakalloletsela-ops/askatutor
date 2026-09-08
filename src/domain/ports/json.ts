/**
 * JSON-compatible value type. Used for Domain rows whose payload shapes are
 * opaque (AJV-validated JSON stored in Supabase jsonb columns) so that the
 * Application-layer contracts remain serializable across the server fn
 * boundary.
 */
export type JsonValue =
  null | string | number | boolean | JsonValue[] | { [key: string]: JsonValue };
