import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { Toaster } from "@/presentation/domains/8-core-ux-navigation/ui/sonner";
import { AuthProvider } from "@/presentation/domains/3-personalization-role-context/hooks/use-auth";
import { ThemeProvider } from "@/presentation/domains/8-core-ux-navigation/hooks/use-theme";
import { MobileTabBar } from "@/presentation/domains/8-core-ux-navigation/MobileTabBar.tsx";
import { InstallPrompt } from "@/presentation/domains/8-core-ux-navigation/InstallPrompt.tsx";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <main
      className="flex min-h-[100svh] items-center justify-center bg-background px-4"
      aria-labelledby="not-found-title"
    >
      <div className="max-w-md text-center">
        <p className="text-sm font-medium text-primary">AskATutorLive</p>
        <h1 id="not-found-title" className="mt-2 text-6xl font-bold tracking-tight">
          404
        </h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you’re looking for doesn’t exist or may have moved.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex min-h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  return (
    <main
      className="flex min-h-[100svh] items-center justify-center bg-background px-4"
      aria-labelledby="error-title"
    >
      <div className="max-w-md text-center">
        <p className="text-sm font-medium text-destructive">AskATutorLive</p>
        <h1 id="error-title" className="mt-2 text-xl font-semibold">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We couldn’t load this page. Please try again, or return home if the problem continues.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex min-h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Try again
          </button>
          <Link
            to="/"
            className="inline-flex min-h-10 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "AskATutorLive — Learn with the right support" },
      {
        name: "description",
        content:
          "Ask questions, learn with tutors, practise, and build your understanding with technology and AI supporting the learning journey.",
      },
      { property: "og:title", content: "AskATutorLive — Learn with the right support" },
      {
        property: "og:description",
        content:
          "Ask questions, learn with tutors, practise, and build your understanding with technology and AI supporting the learning journey.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "AskATutorLive — Learn with the right support" },
      {
        name: "twitter:description",
        content:
          "Ask questions, learn with tutors, practise, and build your understanding with technology and AI supporting the learning journey.",
      },
      {
        property: "og:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/353d268d-b2bf-4c87-b265-9c526e9802b2",
      },
      {
        name: "twitter:image",
        content:
          "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/353d268d-b2bf-4c87-b265-9c526e9802b2",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#0b1220" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "AskATutorLive" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "apple-touch-icon", href: "/logo.png" },
      { rel: "icon", href: "/logo.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <div className="pb-16 md:pb-0">
            <Outlet />
          </div>
          <MobileTabBar />
          <InstallPrompt />
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
