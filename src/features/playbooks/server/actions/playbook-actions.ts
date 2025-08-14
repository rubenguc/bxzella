"use server";

import {
  createPlaybook,
  updatePlaybook,
  deletePlaybook,
} from "../db/playbooks";
import { Playbook } from "@/features/playbooks/interfaces/playbook-interfaces";
import { handleServerActionError } from "@/utils/server-api-utils";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function createPlaybookAction(playbookData: Partial<Playbook>) {
  try {
    const { userId } = await auth();

    if (userId === null) return handleServerActionError("not_authenticated");

    await createPlaybook({ ...playbookData, userId });
    revalidatePath("/playbooks");
    return { error: false, message: "" };
  } catch (error) {
    console.error("Error creating playbook:", error);
    return handleServerActionError("failed_to_create_playbook");
  }
}

export async function updatePlaybookAction(
  id: string,
  playbookData: Partial<Playbook>,
) {
  try {
    const { userId } = await auth();

    if (userId === null) return handleServerActionError("not_authenticated");

    const playbook = await updatePlaybook(id, playbookData);
    if (!playbook) {
      return handleServerActionError("playbook_not_found");
    }
    return { error: false, message: "" };
  } catch (error) {
    console.error("Error updating playbook:", error);
    return handleServerActionError("failed_to_update_playbook");
  }
}

export async function deletePlaybookAction(id: string) {
  try {
    const playbook = await deletePlaybook(id);
    if (!playbook) {
      return handleServerActionError("playbook_not_found");
    }
    return { error: false, message: "playbook_deleted_successfully" };
  } catch (error) {
    console.error("Error deleting playbook:", error);
    return handleServerActionError("failed_to_delete_playbook");
  }
}
