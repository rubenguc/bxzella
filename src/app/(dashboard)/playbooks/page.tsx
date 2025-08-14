"use client";

import { PlaybooksDialogs } from "@/features/playbooks/components/playbooks-dialogs";
import { PlaybooksHeader } from "@/features/playbooks/components/playbooks-header";
import { PlaybooksList } from "@/features/playbooks/components/playbooks-list";
import PlaybooksProvider from "@/features/playbooks/context/playbooks-context";

export default function Playbooks() {
  return (
    <PlaybooksProvider>
      <PlaybooksHeader />
      <PlaybooksList />
      <PlaybooksDialogs />
    </PlaybooksProvider>
  );
}
