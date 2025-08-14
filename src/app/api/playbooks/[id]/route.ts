import connectDB from "@/db/db";
import {
  getPlaybookById,
  updatePlaybook,
  deletePlaybook
} from "@/features/playbooks/server/db/playbooks";
import { handleApiError } from "@/utils/server-api-utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    await connectDB();
    const playbook = await getPlaybookById(id);
    
    if (!playbook) {
      return new Response("Playbook not found", { status: 404 });
    }
    
    return NextResponse.json(playbook);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    await connectDB();
    const playbook = await updatePlaybook(id, body);
    
    if (!playbook) {
      return new Response("Playbook not found", { status: 404 });
    }
    
    return NextResponse.json(playbook);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    await connectDB();
    const playbook = await deletePlaybook(id);
    
    if (!playbook) {
      return new Response("Playbook not found", { status: 404 });
    }
    
    return new Response(null, { status: 204 });
  } catch (err) {
    return handleApiError(err);
  }
}