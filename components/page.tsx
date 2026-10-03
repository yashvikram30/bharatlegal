import Link from "next/link";
import { ArrowLeft, Scale, type LucideIcon } from "lucide-react";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Shared page chrome, so every screen has the same width, spacing, and header.
 * The layout already provides <main>, so these render plain divs.
 *
 *   wide - every content page (default). One width, so titles never jump between pages.
 *          Long text should cap its own line length (e.g. `max-w-3xl`) instead of narrowing the page.
 *   form - a single centered card (sign in, reset password, profile)
 */
const widths = {
  wide: "max-w-5xl",
  form: "max-w-md",
} as const;

export function PageShell({
  width = "wide",
  className,
  children,
}: {
  width?: keyof typeof widths;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "container mx-auto space-y-8 px-4 py-10 sm:px-6 sm:py-14",
        widths[width],
        className
      )}
    >
      {children}
    </div>
  );
}

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 print:hidden"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      {children}
    </Link>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  backHref,
  backLabel,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Buttons or status shown to the right of the title on wide screens. */
  actions?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  className?: string;
}) {
  return (
    <header className={cn("space-y-4 print:hidden", className)}>
      {backHref && <BackLink href={backHref}>{backLabel ?? "Back"}</BackLink>}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-3">
          <h1 className="text-balance font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

export function SectionHeading({
  title,
  description,
  actions,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <div className="min-w-0 space-y-1">
        <h2 className="text-balance font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {title}
        </h2>
        {description && <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

/** One empty / signed-out / nothing-here-yet block, used the same way on every page. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-border bg-card/50 px-6 py-12 text-center",
        className
      )}
    >
      {Icon && (
        <span className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-forest-800 dark:text-gold-400">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      )}
      <h2 className="font-display text-xl font-semibold text-foreground">{title}</h2>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}

/** The centered logo-mark header used by every single-card page (sign in, reset password, profile). */
export function FormCardHeader({ title, description }: { title: string; description?: string }) {
  return (
    <CardHeader className="space-y-2 pb-4 text-center">
      <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-gold-500/50 bg-forest-800 text-white dark:bg-forest-950">
        <Scale className="h-5 w-5" aria-hidden="true" />
      </span>
      <CardTitle>{title}</CardTitle>
      {description && <CardDescription className="text-sm">{description}</CardDescription>}
    </CardHeader>
  );
}
