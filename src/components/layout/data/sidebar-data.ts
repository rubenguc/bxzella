import {
  BookCheck,
  BookText,
  ChartNoAxesColumn,
  House,
  Info,
  MessageSquareText,
  NotebookText,
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
          title: "daily-journal",
          url: "/daily-journal",
          icon: ChartNoAxesColumn,
        },
        {
          title: "trades",
          url: "/trades",
          icon: BookText,
        },
        {
          title: "trading-assistant",
          url: "/trading-assistant",
          icon: MessageSquareText,
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
          title: "notebooks",
          url: "/notebooks",
          icon: NotebookText,
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
