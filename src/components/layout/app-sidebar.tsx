"use client";

import { ComponentProps } from "react";
import { Sidebar, SidebarContent } from "../ui/sidebar";
import { sidebarItems } from "./data/sidebar-data";
import { NavGroup } from "./nav-group";

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        {sidebarItems.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
