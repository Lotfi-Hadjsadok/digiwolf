import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    return NextResponse.json({ hasAdmin: userCount > 0 });
  } catch (error) {
    console.error("Failed to check admin status", error);
    return NextResponse.json(
      { error: "Unable to verify admin status" },
      { status: 500 },
    );
  }
}


