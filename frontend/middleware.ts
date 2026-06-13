// frontend/middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC = ["/login", "/register"];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Token can be in cookie (set by authStore) or Authorization header
    const token =
        request.cookies.get("ht_token")?.value ||
        request.headers.get("authorization")?.replace("Bearer ", "");

    const isPublic = PUBLIC.some((p) => pathname.startsWith(p));

    if (!token && !isPublic) {
        return NextResponse.redirect(new URL("/login", request.url));
    }
    if (token && isPublic) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
