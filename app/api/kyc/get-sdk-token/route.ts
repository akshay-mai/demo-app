import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = verifyToken(auth.slice(7));
  if (!payload) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, verificationType: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const type = user.verificationType || "KYC";

  try {
    const host = req.headers.get("origin") || "http://localhost:3000";
    const callbackUrl = `${host}/callback`;

    const res = await fetch("https://stg-kycapi.p2eppl.com/v1/kyc/getSdkToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.KYC_API_KEY || "",
      },
      body: JSON.stringify({
        userId: String(user.id),
        email: user.email,
        type,
        callbackUrl,
      }),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "KYC API error" }, { status: 500 });
  }
}
