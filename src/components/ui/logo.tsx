import * as React from "react";
import { cn } from "@/lib/utils";

export interface LogoProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> {
  size?: number | string;
}

export function Logo({ size = 36, className, width, height, style, ...props }: LogoProps) {
  const resolvedWidth = width ?? size;
  const resolvedHeight = height ?? size;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.svg"
      alt="Horarios"
      width={resolvedWidth}
      height={resolvedHeight}
      className={cn("shrink-0 select-none", className)}
      style={style}
      {...props}
    />
  );
}
