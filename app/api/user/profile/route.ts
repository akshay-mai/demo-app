import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

function getTokenFromRequest(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (auth && auth.startsWith("Bearer ")) {
    return auth.slice(7);
  }
  return null;
}

export async function GET(req: Request) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      name: true,
      email: true,
      gender: true,
      dateOfBirth: true,
      phone: true,
      address: true,
      city: true,
      state: true,
      country: true,
      pincode: true,
      occupation: true,
      nationality: true,
    },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({ user });
}

export async function PUT(req: Request) {
  const token = getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = verifyToken(token);
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  try {
    const body = await req.json();
    const {
      verificationType,
      gender,
      dateOfBirth,
      phone,
      address,
      city,
      state,
      country,
      pincode,
      occupation,
      nationality,
    } = body;

    const updated = await prisma.user.update({
      where: { id: payload.userId },
      data: {
        ...(verificationType !== undefined && { verificationType }),
        ...(gender !== undefined && { gender }),
        ...(dateOfBirth !== undefined && { dateOfBirth }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(country !== undefined && { country }),
        ...(pincode !== undefined && { pincode }),
        ...(occupation !== undefined && { occupation }),
        ...(nationality !== undefined && { nationality }),
      },
    });

    return NextResponse.json({
      message: "Profile updated",
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        verificationType: updated.verificationType,
        gender: updated.gender,
        address: updated.address,
        city: updated.city,
        state: updated.state,
        country: updated.country,
        phone: updated.phone,
        occupation: updated.occupation,
        nationality: updated.nationality,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
