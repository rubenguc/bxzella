"use client";

import { motion } from "motion/react";
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
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col md:flex-row gap-2 w-full"
          >
            <NotebooksFoldersSidebar />
            <Card className="flex flex-col md:flex-row flex-1 px-1 border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
              <NotebooksList />
              <NotebookDetails />
            </Card>
          </motion.div>
        </SidebarProvider>
        <NotebookFoldersDialogs />
      </NotebooksProvider>
    </NotebookFoldersProvider>
  );
}
