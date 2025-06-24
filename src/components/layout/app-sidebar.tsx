"use client";

import { ComponentProps } from "react";
import { Sidebar, SidebarContent, useSidebar } from "../ui/sidebar";
import { sidebarItems } from "./data/sidebar-data";
import { NavGroup } from "./nav-group";
import Image from "next/image";

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const { open, isMobile, openMobile } = useSidebar();

  const showText = isMobile ? open || openMobile : open;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <div className="flex items-center gap-1 mx-auto pt-5  w-full justify-center">
          <Image src="/logo.png" alt="Logo" width={32} height={32} />
          <span
            className={`text-2xl transition-opacity duration-300 ${showText ? "block" : "hidden"} bg-clip-text text-transparent bg-gradient-to-r from-blue-400 dark:to-white to-gray-500`}
          >
            BXZella
          </span>
        </div>
        {sidebarItems.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
