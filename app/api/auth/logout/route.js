// الملف: app/api/auth/logout/route.ts

import { NextResponse } from "next/server";
export async function POST() {
  try {
    const response = NextResponse.json(
      { message: "تم تسجيل الخروج بنجاح" },
      { status: 200 }
    );

    response.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      expires: new Date(0),
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "فشل في تسجيل الخروج" }, { status: 500 });
  }
}