import { House, Info } from "lucide-react";

export const sidebarItems = {
  navGroups: [
    {
      title: "General",
      items: [
        {
          title: "Home",
          url: "/",
          icon: House,
        },
        {
          title: "Trades",
          url: "/trades",
          icon: House,
        },
        {
          title: "Accounts",
          url: "/accounts",
          icon: House,
        },
        {
          title: "About",
          url: "/about",
          icon: Info,
        },
      ],
    },
  ],
};
