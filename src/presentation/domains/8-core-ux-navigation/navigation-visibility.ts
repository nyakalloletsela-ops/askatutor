/**
 * Shared navigation visibility rules.
 *
 * Keep these rules in one place so public navigation, the mobile bar, and
 * route-level presentation do not drift into competing shell definitions.
 */
export const APP_SHELL_PREFIXES = [
  "/dashboard",
  "/admin",
  "/ai-tools",
  "/ai-tutor",
  "/messages",
  "/assignments",
  "/records",
  "/notes",
  "/lessons",
  "/calendar",
  "/resources",
  "/courses",
  "/my-courses",
  "/code",
  "/labs",
  "/become-tutor",
  "/certificate",
  "/parent",
  "/wallet",
  "/tutor/availability",
  "/tutor/holidays",
  "/pay-tutor",
  "/checkout.success",
  "/checkout.failed",
  "/checkout.cancelled",
  "/settings",
  "/classroom",
];

export function isAppShellRoute(pathname: string): boolean {
  return APP_SHELL_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isImmersiveRoute(pathname: string): boolean {
  return pathname.startsWith("/classroom/");
}
