import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
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
    select: { email: true, verificationType: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const type = user.verificationType || "KYC";

  try {
    const url = new URL(
      `https://stg-kycapi.p2eppl.com/v1/kyc/checkKycStatus/${encodeURIComponent(user.email)}`
    );
    url.searchParams.set("type", type);

    const res = await fetch(url.toString(), {
      headers: {
        accept: "application/json, text/plain, */*",
        "x-api-key": process.env.KYC_API_KEY || "",
      },
    });

    const data = await res.json();
    return NextResponse.json({ ...data, verificationType: type });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "KYC API error" }, { status: 500 });
  }
}
