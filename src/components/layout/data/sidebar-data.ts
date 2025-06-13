import { BookText, House, Users } from "lucide-react";

export const sidebarItems = {
  navGroups: [
    {
      title: "bxzella",
      items: [
        {
          title: "home",
          url: "/",
          icon: House,
        },
        {
          title: "trades",
          url: "/trades",
          icon: BookText,
        },
        {
          title: "accounts",
          url: "/accounts",
          icon: Users,
        },
      ],
    },
  ],
};
