import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";

import appCss from "../styles.css?url";
import { LanguageProvider } from "@/context/LanguageContext";
import { BetaBanner } from "@/components/BetaBanner";
import { LegalDisclaimerFooter } from "@/components/LegalDisclaimerFooter";


import { trackView } from "@/lib/track-view.functions";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "google-site-verification", content: "apAyMowSM-4tPIwLyaBKur_HpJcCAUUSMqOmP1cQmQc" },
      { title: "DetencionDefensa.com — Pre-Detention Defense Plan" },
      { name: "description", content: "DetencionDefensa.com, Inc. — a pre-detention defense plan for immigrant working families. $199 today + $10/mo from month 3. Not a law firm." },
      { name: "author", content: "DetencionDefensa.com, Inc." },
      { property: "og:title", content: "DetencionDefensa.com — Pre-Detention Defense Plan" },
      { property: "og:description", content: "Pre-detention defense plan for immigrant working families. $199 today + $10/mo from month 3." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "DetencionDefensa.com" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "DetencionDefensa.com — Pre-Detention Defense Plan" },
      { name: "twitter:description", content: "Pre-detention defense plan for immigrant working families. $199 today + $10/mo from month 3." },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700;9..144,800&family=Work+Sans:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Source+Sans+3:wght@400;600;700&family=Merriweather:wght@400;700;900&display=swap" },
      { rel: "stylesheet", href: appCss },
      // Manifest intentionally removed — the project ships a NATIVE Flutter app
      // (TestFlight on iOS, APK on Android). A web manifest with display:standalone
      // caused iPhone Safari to install a fullscreen PWA instead of the Flutter app.

      { rel: "apple-touch-icon", href: "/help-icon-512.png" },
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
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isApp =
    typeof window !== "undefined" && window.location.pathname.startsWith("/app");
  // Routes that render their own footer or shouldn't show the public legal footer.
  const hideGlobalFooter =
    isApp ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/_admin") ||
    pathname.startsWith("/firm") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/attorney") ||
    pathname.startsWith("/retainer") ||
    pathname.startsWith("/lovable/") ||
    pathname.startsWith("/email/");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/")) return;
    trackView({ data: { path: pathname, referrer: document.referrer || null } }).catch(() => {});
  }, [pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        
        <Outlet />
        
        {!hideGlobalFooter && <LegalDisclaimerFooter />}
      </LanguageProvider>
    </QueryClientProvider>
  );
}
