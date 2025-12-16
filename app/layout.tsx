import type { Metadata, Viewport } from "next";
import "./globals.css";
import theme from "@/app/utils/theme";
import CombinedProvider from "@/app/components/CombinedProvider";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "🐶 WAAL",
  description: "WAAL",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

function buildThemeCssVariables(): string {
  const colorVars = Object.entries(theme.colors)
    .map(([key, value]) => `  --color-${key}: ${value};`)
    .join("\n");
  return `:root {\n${colorVars}\n}`;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeCss = buildThemeCssVariables();

  // 서버에서 쿠키로부터 userInfo 읽기
  const cookieStore = await cookies();
  const userInfoCookie = cookieStore.get("user_info");
  let userInfo = null;

  if (userInfoCookie?.value) {
    try {
      userInfo = JSON.parse(userInfoCookie.value);
    } catch (error) {
      console.error("Failed to parse user_info cookie:", error);
    }
  }

  return (
    <html lang="en">
      <head>
        <link
          href="https://unpkg.com/pretendard@1.3.9/dist/web/static/pretendard.css"
          rel="stylesheet"
        />
        <script
          src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
          async
        />
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
      </head>
      <body suppressHydrationWarning className="font-sans">
        <CombinedProvider userInfo={userInfo}>{children}</CombinedProvider>
      </body>
    </html>
  );
}
