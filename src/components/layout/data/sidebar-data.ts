import {
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
          title: "ai_summary",
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
          title: "info",
          icon: Info,
          items: [
            {
              title: "create_api_key",
              url: "/info/create-api-key",
              icon: SquareAsterisk,
            },
          ],
        },
      ],
    },
  ],
};
