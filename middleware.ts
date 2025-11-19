import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 인증이 필요없는 경로들
  const publicPaths = ["/", "/login"];
  const isPublicPath =
    publicPaths.includes(pathname) ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/find");

  // 공개 경로면 그대로 진행
  if (isPublicPath) {
    return NextResponse.next();
  }

  // 쿠키에서 토큰 확인
  const accessToken = request.cookies.get("access_token");
  const userInfo = request.cookies.get("user_info");

  // 토큰이 없으면 메인 페이지로 리다이렉트
  if (!accessToken || !userInfo) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // 토큰이 있으면 그대로 진행
  return NextResponse.next();
}

// matcher 설정: 어떤 경로에 middleware를 적용할지
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images).*)",
  ],
};
