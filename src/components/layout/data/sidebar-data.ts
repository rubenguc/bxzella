import {
  BookCheck,
  BookText,
  Bot,
  House,
  Info,
  SquareAsterisk,
  Users,
} from "lucide-react";

export const sidebarItems = {
  navGroups: [
    {
      title: "",
      items: [
        {
          title: "home",
          url: "/",
          icon: House,
        },
        {
          title: "ai-summary",
          url: "/ai-summary",
          icon: Bot,
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
        {
          title: "playbooks",
          url: "/playbooks",
          icon: BookCheck,
        },
        {
          title: "info",
          icon: Info,
          items: [
            {
              title: "create-api-key",
              url: "/info/create-api-key",
              icon: SquareAsterisk,
            },
          ],
        },
      ],
    },
  ],
};
