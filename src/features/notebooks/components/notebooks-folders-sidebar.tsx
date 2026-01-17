"use client";

import { useQuery } from "@tanstack/react-query";
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
      className={`${isOpen ? "md:w-(--sidebar-width)" : "md:w-(--sidebar-width-icon)"} transition-[left,right,width] duration-200 ease-linear overflow-hidden py-0 gap-2`}
    >
      <div
        className={`flex p-2 items-center justify-between ${isOpen ? "flex-row" : "flex-col"} `}
      >
        <Button
          variant="ghost"
          onClick={() => setOpen("add")}
          aria-label={tCommon("aria_add", { item: t("folder") })}
        >
          <FolderPlus />
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
          <ChevronLeft />
        </Button>
      </div>
      <div className="flex-1">
        {showLoading ? (
          <div className="flex justify-center">
            <Spinner />
          </div>
        ) : (
          <ul className="flex flex-col">
            <li>
              <Button
                className={`rounded-none justify-start px-3 w-full ${selectedNotebookFolder === null ? "bg-accent/90" : ""}`}
                variant="ghost"
                onClick={() => {
                  setSelectedNotebookFolder(null);
                }}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-1 h-6 rounded-xl"
                    style={{ backgroundColor: FOLDER_COLORS[0] }}
                  />
                  <span>
                    {isOpen ? t("all_notes") : t("all_notes").charAt(0)}
                  </span>
                </div>
              </Button>
            </li>
            {notebooksFolders.map((notebookFolder) => (
              <li key={notebookFolder._id}>
                <Button
                  data-active="false"
                  className={`px-3 w-full justify-between ${selectedNotebookFolder?._id === notebookFolder._id ? "bg-accent/90" : ""}`}
                  variant="ghost"
                  onClick={(e) => {
                    setSelectedNotebookFolder(notebookFolder);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-1 h-6 rounded-xl"
                      style={{
                        backgroundColor: getTagColor(notebookFolder),
                      }}
                    />
                    <span>{getFolderName(notebookFolder, isOpen)}</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="rounded-xl hover:bg-primary p-1"
                        aria-label={tCommon("aria_menu_more")}
                        type="button"
                      >
                        <Ellipsis className="z-50" />
                      </button>
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
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
