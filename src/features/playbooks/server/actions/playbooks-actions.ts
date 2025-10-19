"use server";

import connectDB from "@/db/db";
import type { Playbook } from "@/features/playbooks/interfaces/playbooks-interfaces";
import { getUserAuth, handleServerActionError } from "@/utils/server-api-utils";
import {
  createPlaybook,
  deletePlaybook,
  updatePlaybook,
} from "../db/playbooks-db";

export async function createPlaybookAction(playbookData: Partial<Playbook>) {
  try {
    await connectDB();
    await createPlaybook(playbookData);
    return { error: false, message: "" };
  } catch (error) {
    return handleServerActionError("failed_to_create_playbook", error);
  }
}

export async function updatePlaybookAction(
  id: string,
  playbookData: Partial<Playbook>,
) {
  try {
    await getUserAuth();
    await connectDB();
    const playbook = await updatePlaybook(id, playbookData);
    if (!playbook) return handleServerActionError("playbook_not_found");
    return { error: false, message: "" };
  } catch (error) {
    return handleServerActionError("failed_to_update_playbook", error);
  }
}

export async function deletePlaybookAction(id: string) {
  try {
    await getUserAuth();
    await connectDB();
    const playbook = await deletePlaybook(id);
    if (!playbook) return handleServerActionError("playbook_not_found");
    return { error: false, message: "playbook_deleted_successfully" };
  } catch (error) {
    return handleServerActionError("failed_to_delete_playbook", error);
  }
}
