"use server";

import { cookies } from "next/headers";

export const changeLanguage = async (newLocale: string) => {
  const cookieStore = await cookies();
  cookieStore.set("BXZELLA_LOCALE", newLocale);
};
