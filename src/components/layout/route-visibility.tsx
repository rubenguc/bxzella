"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface RouteVisibilityProps {
  children: ReactNode;
  showOn?: string[];
  hideOn?: string[];
}

function matchesRoute(currentPath: string, routes: string[]): boolean {
  return routes.some((route) => {
    if (route === currentPath) return true;
    if (route.endsWith("/*")) {
      const prefix = route.slice(0, -2);
      return currentPath.startsWith(prefix);
    }
    return false;
  });
}

export function RouteVisibility({
  children,
  showOn,
  hideOn,
}: RouteVisibilityProps) {
  const pathname = usePathname();
  const currentPath = pathname.split("?")[0];

  const shouldShow = showOn
    ? matchesRoute(currentPath, showOn)
    : hideOn
      ? !matchesRoute(currentPath, hideOn)
      : true;

  if (!shouldShow) {
    return null;
  }

  return <>{children}</>;
}
