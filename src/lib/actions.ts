"use server";
import { prisma } from "@/prisma";

export async function updateUsername(formData: FormData) {
  const username = formData.get("username")?.toString();
  const email = formData.get("email")?.toString();
  if (!username || !email) return;
  await prisma.user.update({
    where: { email },
    data: { username },
  });
}