import { m } from "#/paraglide/messages";

/**
 * Better-auth error codes mapped to user-facing i18n messages.
 * Covers sign-in, sign-up, and generic API errors.
 */
const errorCodeMap: Record<string, () => string> = {
  // Sign-in
  INVALID_EMAIL_OR_PASSWORD: m["auth.error_invalid_credentials"],
  USER_EMAIL_NOT_FOUND: m["auth.error_user_not_found"],
  EMAIL_NOT_VERIFIED: m["auth.error_email_not_verified"],
  INVALID_EMAIL: m["auth.error_invalid_email"],
  USER_NOT_FOUND: m["auth.error_user_not_found"],

  // Sign-up / password
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: m["auth.error_user_already_exists"],
  INVALID_PASSWORD: m["auth.error_invalid_password"],
  PASSWORD_TOO_SHORT: m["auth.error_password_too_short"],
  PASSWORD_TOO_LONG: m["auth.error_password_too_long"],
  FAILED_TO_CREATE_USER: m["auth.error_failed_to_create_user"],
  FAILED_TO_CREATE_SESSION: m["auth.error_failed_to_create_user"],

  // Generic
  INTERNAL_SERVER_ERROR: m["auth.error_server"],
  UNKNOWN_ERROR: m["auth.error_server"],
};

/**
 * Given a better-auth error object, return a user-friendly translated message.
 *
 * Priority:
 *  1. Error code mapped via errorCodeMap
 *  2. HTTP status 500+ → server error
 *  3. fallback passed as second argument
 */
export function toAuthErrorMessage(
  error:
    { code?: string; message?: string; status?: number } | null | undefined,
  fallback: () => string = m["auth.error_invalid_credentials"],
): string {
  if (!error) return fallback();

  // Try code-based mapping first
  if (error.code && errorCodeMap[error.code]) {
    return errorCodeMap[error.code]();
  }

  // Fall back by HTTP status (only 500+)
  if (error.status && error.status >= 500) return m["auth.error_server"]();

  // Last resort
  return fallback();
}
