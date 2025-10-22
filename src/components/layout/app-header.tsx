"use client";

import { type HTMLAttributes, useEffect, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AccountsSelector } from "@/features/accounts/components/accounts-selector";
import { cn } from "@/lib/utils";
import { DateRangeSelector } from "./DateRangeSelector";
import "./header.styles.css";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { AccountsCoinSelector } from "@/features/accounts/components/accounts-coin-selector";

interface HeaderProps extends HTMLAttributes<HTMLElement> {
  fixed?: boolean;
  ref?: React.Ref<HTMLElement>;
}

export default function AppHeader({ className, fixed, ...props }: HeaderProps) {
  const tSidebar = useTranslations("sidebar");
  const pathname = usePathname();
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

  const parsedPathname = pathname.split("/")[1];

  return (
    <header
      className={cn(
        "bg-sidebar flex h-16 items-center gap-3 p-4 sm:gap-4 border-b",
        fixed && "header-fixed peer/header fixed z-50 w-[inherit]",
        offset > 10 && fixed ? "shadow-sm" : "shadow-none",
        className,
      )}
      {...props}
    >
      <SidebarTrigger variant="outline" className="scale-125 sm:scale-100" />
      <span className="font-semibold md:text-xl text-ellipsis overflow-hidden whitespace-nowrap">
        {tSidebar(parsedPathname as string)}
      </span>
      <div className="ml-auto flex items-center space-x-4">
        <DateRangeSelector />
        <AccountsSelector />
        <AccountsCoinSelector />
      </div>
    </header>
  );
}

AppHeader.displayName = "Header";
