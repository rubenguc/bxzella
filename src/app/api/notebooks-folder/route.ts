import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/db/db";
import { getAccountById } from "@/features/accounts/server/db/accounts-db";
import {
  getAllNotebooksFolders,
  initializeNotebooksFolder,
} from "@/features/notebooks/server/db/notebooks-folder-db";
import { handleApiError, parseSearchParams } from "@/utils/server-api-utils";
import {
  accountIdParamValidation,
  coinParamValidation,
} from "@/utils/zod-utils";

const playbooksSearchParamsSchema = z.object({
  accountId: accountIdParamValidation(),
  coin: coinParamValidation(),
});

export async function GET(request: NextRequest) {
  try {
    const { accountId } = parseSearchParams(
      request,
      playbooksSearchParamsSchema,
    );

    await connectDB();
    const account = await getAccountById(accountId);

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    await initializeNotebooksFolder(account?._id);

    const data = await getAllNotebooksFolders({
      accountId,
    });

    return NextResponse.json(data);
  } catch (err) {
    return handleApiError(err);
  }
}
