"use client";

import { Card } from "@/components/ui/card";
import { SidebarProvider } from "@/components/ui/sidebar";
import { NotebookFoldersDialogs } from "@/features/notebooks/components/notebook-folders-dialogs";
import { NotebookDetails } from "@/features/notebooks/components/notebooks-details";
import { NotebooksFoldersSidebar } from "@/features/notebooks/components/notebooks-folders-sidebar";
import { NotebooksList } from "@/features/notebooks/components/notebooks-list";
import { NotebookFoldersProvider } from "@/features/notebooks/context/notebook-folders-context";
import { NotebooksProvider } from "@/features/notebooks/context/notebooks-context";

export default function Notebooks() {
  return (
    <NotebookFoldersProvider>
      <NotebooksProvider>
        <SidebarProvider className="min-h-fit flex-1 sidebar-wrapper-with-flex">
          <div className="flex flex-col md:flex-row gap-2 w-full">
            <NotebooksFoldersSidebar />
            <Card className="flex flex-col md:flex-row flex-1 px-1">
              <NotebooksList />
              <NotebookDetails />
            </Card>
          </div>
        </SidebarProvider>
        <NotebookFoldersDialogs />
      </NotebooksProvider>
    </NotebookFoldersProvider>
  );
}
