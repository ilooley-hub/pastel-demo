import { cn } from "@/lib/utils";

/** Official Pastel logo lockup (icon + wordmark), served from /public. */
export function Logo({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/pastel-logo.svg"
      alt="Pastel"
      className={cn("h-8 w-auto select-none", className)}
      draggable={false}
    />
  );
}
