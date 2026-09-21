import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-40 w-full resize-y rounded-lg bg-card px-4 py-3 text-sm leading-relaxed text-foreground shadow-[var(--shadow-border)] placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
