"use client";

import Link from "next/link";
import { Ticket } from "lucide-react";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  href?: string;
  className?: string;
  /** Smaller when the header is scrolled */
  size?: "default" | "compact";
  /** Footer sits on solid black */
  variant?: "header" | "footer";
};

export function BrandLogo({
  href = "/",
  className,
  size = "default",
  variant = "header",
}: BrandLogoProps) {
  const compact = size === "compact";

  const mark = (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 rounded-full transition-all duration-500",
        "bg-zinc-950 text-white shadow-[0_8px_32px_rgba(0,0,0,0.35)]",
        "ring-1 ring-white/[0.12]",
        variant === "footer" && "bg-zinc-950/95 ring-white/[0.18]",
        compact ? "px-2.5 py-1.5 gap-2" : "px-3.5 py-2",
        className
      )}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full",
          "bg-gradient-to-b from-zinc-800 to-zinc-950 ring-1 ring-white/10",
          compact ? "h-7 w-7" : "h-9 w-9"
        )}
      >
        <Ticket
          className={cn(
            "text-zinc-50 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]",
            compact ? "h-3.5 w-3.5" : "h-[18px] w-[18px]",
            "stroke-[1.85]"
          )}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        />
      </span>
      <span
        className={cn(
          "font-display font-normal text-white",
          compact ? "text-[0.95rem] leading-none tracking-[0.05em]" : "text-lg leading-none tracking-[0.08em] md:text-xl md:tracking-[0.09em]"
        )}
      >
        Eventtts
      </span>
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="group shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full">
        {mark}
      </Link>
    );
  }

  return mark;
}
