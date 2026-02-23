"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { ChevronLeft, Ellipsis, FolderPlus } from "lucide-react";
import {
  useTranslations,
  useTranslations as useTranslationsCommon,
} from "next-intl";
import { useToggle } from "react-use";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { getAllNotebooksFolders } from "@/features/notebooks/services/notebooks-folder-services";
import { useUserConfigStore } from "@/store/user-config-store";
import { useNotebookFoldersContext } from "../context/notebook-folders-context";
import type { NotebookFolder } from "../interfaces/notebooks-folder-interfaces";
import { FOLDER_COLORS } from "../utils/notebooks-folder-utils";

export function NotebooksFoldersSidebar() {
  const t = useTranslations("notebooks.notebooks_folder");
  const tCommon = useTranslationsCommon("common_messages");

  const [isOpen, toggleOpen] = useToggle(true);

  const { selectedAccount, coin } = useUserConfigStore();

  const {
    setSelectedNotebookFolder,
    selectedNotebookFolder,
    setOpen,
    setSelectedNotebookFolderAction,
  } = useNotebookFoldersContext();

  const { data, isLoading } = useQuery({
    queryKey: ["notebooks-folders", selectedAccount?._id],
    queryFn: () =>
      getAllNotebooksFolders({
        accountId: selectedAccount!._id,
        coin,
      }),
    enabled: !!selectedAccount?._id && !!coin,
  });

  const notebooksFolders = data ?? [];

  const getFolderName = (notebookFolder: NotebookFolder, isOpen = false) => {
    const name = notebookFolder.isDefault
      ? t(notebookFolder.name)
      : notebookFolder.name;

    if (!isOpen) return name.charAt(0);
    return name;
  };

  const getTagColor = (notebookFolder: NotebookFolder) => {
    if (notebookFolder.tagColor !== "system") return notebookFolder.tagColor;

    return FOLDER_COLORS[0];
  };

  const showLoading = isLoading || notebooksFolders.length === 0;

  return (
    <Card
      className={`${isOpen ? "md:w-(--sidebar-width)" : "md:w-(--sidebar-width-icon)"} transition-[left,right,width] duration-200 ease-linear overflow-hidden py-0 gap-2 border-border/50 bg-muted/30`}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`flex p-2 items-center justify-between ${isOpen ? "flex-row" : "flex-col"} `}
      >
        <Button
          variant="ghost"
          onClick={() => setOpen("add")}
          aria-label={t("add_folder")}
          className="gap-2"
        >
          <FolderPlus className="h-5 w-5" />
          <span className={`${!isOpen && "md:hidden"}`}>{t("add_folder")}</span>
        </Button>
        <Button
          className="hidden md:block"
          variant="ghost"
          onClick={toggleOpen}
          aria-label={
            isOpen ? tCommon("aria_previous_month") : tCommon("aria_next_month")
          }
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </motion.div>
      <div className="flex-1 overflow-y-auto">
        {showLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <ul className="flex flex-col gap-1 p-2">
            <li>
              <Button
                className={`rounded-lg justify-start px-3 w-full transition-all duration-200 ${selectedNotebookFolder === null ? "bg-accent/80" : ""}`}
                variant="ghost"
                onClick={() => {
                  setSelectedNotebookFolder(null);
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-1.5 h-6 rounded-full shadow-sm"
                    style={{ backgroundColor: FOLDER_COLORS[0] }}
                  />
                  <span className="font-medium">
                    {isOpen ? t("all_notes") : t("all_notes").charAt(0)}
                  </span>
                </div>
              </Button>
            </li>
            {notebooksFolders.map((notebookFolder, index) => (
              <motion.li
                key={notebookFolder._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
              >
                <Button
                  data-active="false"
                  className={`px-3 w-full justify-between rounded-lg transition-all duration-200 ${selectedNotebookFolder?._id === notebookFolder._id ? "bg-accent/80" : ""}`}
                  variant="ghost"
                  onClick={(e) => {
                    setSelectedNotebookFolder(notebookFolder);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-1.5 h-6 rounded-full shadow-sm"
                      style={{
                        backgroundColor: getTagColor(notebookFolder),
                      }}
                    />
                    <span className="font-medium">
                      {getFolderName(notebookFolder, isOpen)}
                    </span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div
                        className="rounded-lg hover:bg-accent/50 p-1 transition-colors cursor-pointer"
                        aria-label={tCommon("aria_menu_more")}
                      >
                        <Ellipsis className="h-4 w-4" />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNotebookFolderAction(notebookFolder);
                          setOpen("edit");
                        }}
                      >
                        Edit
                      </DropdownMenuItem>
                      {!notebookFolder.isDefault && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedNotebookFolderAction(notebookFolder);
                            setOpen("delete");
                          }}
                        >
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Button>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
