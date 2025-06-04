"use client";

import { HTMLAttributes, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeSwitch } from "../theme-switcher";
import { ThemeProvider } from "@/context/theme-context";
import { ProfileDropdown } from "../profile-dropdown";

interface HeaderProps extends HTMLAttributes<HTMLElement> {
  fixed?: boolean;
  ref?: React.Ref<HTMLElement>;
}

export default function AppHeader({
  className,
  fixed,

  ...props
}: HeaderProps) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop);
    };

    // Add scroll listener to the body
    document.addEventListener("scroll", onScroll, { passive: true });

    // Clean up the event listener on unmount
    return () => document.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <ThemeProvider>
      <header
        className={cn(
          "bg-background flex h-16 items-center gap-3 p-4 sm:gap-4 border-b",
          fixed && "header-fixed peer/header fixed z-50 w-[inherit] rounded-md",
          offset > 10 && fixed ? "shadow-sm" : "shadow-none",
          className,
        )}
        {...props}
      >
        <SidebarTrigger variant="outline" className="scale-125 sm:scale-100" />
        <div className="ml-auto flex items-center space-x-4">
          {/* <Search /> */}
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </header>
    </ThemeProvider>
  );
}

AppHeader.displayName = "Header";
