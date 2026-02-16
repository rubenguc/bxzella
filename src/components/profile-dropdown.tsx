"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUserConfigStore } from "@/store/user-config-store";

interface ProfileDropdownProps {
  showText: boolean;
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ProfileDropdown({ showText }: ProfileDropdownProps) {
  const t = useTranslations("header");

  const { cleanStore } = useUserConfigStore();

  const { user } = useUser();
  const { signOut } = useClerk();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    cleanStore();
  };

  const displayName = mounted ? user?.fullName : undefined;
  const imageUrl = mounted ? user?.imageUrl : undefined;
  const initials = getInitials(displayName);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`relative rounded-full mx-auto ${!showText && "h-8 w-8"}`}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={imageUrl} alt={displayName || ""} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <p
            className={`text-sm leading-none font-medium ${!showText && "hidden"}`}
          >
            {displayName}
          </p>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-fit min-w-40" align="end" forceMount>
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/settings">{t("settings")}</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          {t("log_out")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
