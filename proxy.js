// middleware.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function proxy(request) {
  const token = request.cookies.get("auth-token")?.value;
  const { pathname } = request.nextUrl;

  const isPublicAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/assets") ||
    /\.(png|jpg|jpeg|gif|svg|webp|ico|json|txt|js|css|map|woff|woff2|ttf|eot)$/i.test(pathname) ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/offline.html" ||
    pathname === "/favicon.ico";

  // الصفحات العامة (بدون تسجيل دخول)
  const publicPaths = [
    "/",
    "/menu",
    "/login",
    "/manifest.webmanifest",
    "/favicon.ico",
    "/logo.svg",
    "/logo.jpeg",
    "/logo-fallback.svg",
    "/icon-192.png",
    "/icon-512.png",
    "/offline.html"
  ];

  if (isPublicAsset || publicPaths.includes(pathname)) {
    // إذا كان مسجل دخول وحاول يفتح /login، نقله لـ Dashboard
    if (pathname === "/login" && token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key-change-this");
        if (decoded.role === "admin") {
          return NextResponse.redirect(new URL("/admin/dashboard", request.url));
        } else {
          return NextResponse.redirect(new URL("/cashier", request.url));
        }
      } catch {
        // Token غلط، كمل عادي
      }
    }
    return NextResponse.next();
  }

  // الصفحات المحمية
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key-change-this");
    
    // صفحات Admin فقط
    if (pathname.startsWith("/admin") && decoded.role !== "admin") {
      return NextResponse.redirect(new URL("/cashier", request.url));
    }

    // صفحات Cashier فقط
    if (pathname.startsWith("/cashier") && decoded.role !== "cashier") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    const response = NextResponse.next();
    response.headers.set("x-user-id", decoded.userId);
    response.headers.set("x-user-role", decoded.role);
    response.headers.set("x-username", decoded.username);
    
    return response;
  } catch (error) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.set("auth-token", "", {
      httpOnly: true,
      expires: new Date(0),
      path: "/",
    });
    return response;
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
