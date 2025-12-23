"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { cookies } from "../utils/cookies";

const queryClient = new QueryClient();

// UserInfo 타입 정의
interface UserInfo {
  id: number;
  memberId: string;
  email: string;
  name: string;
  memberPhone: string;
  role: string;
  academyId: number | null;
  academyAdmin: boolean;
  academyName: string;
}

// UserContext 생성
const UserContext = createContext<UserInfo | null>(null);

// useAuth hook
export function useAuth() {
  return useContext(UserContext);
}

// 클라이언트에서 쿠키를 읽어서 초기 상태 설정
function getInitialUserInfo(serverUserInfo?: UserInfo | null): UserInfo | null {
  // 서버에서 받은 userInfo가 있으면 사용
  if (serverUserInfo) {
    return serverUserInfo;
  }

  // 클라이언트 사이드에서만 쿠키 읽기
  if (typeof window !== "undefined") {
    const userInfoCookie = cookies.get("user_info");
    if (userInfoCookie) {
      try {
        return JSON.parse(userInfoCookie);
      } catch (error) {
        console.error("Failed to parse user_info cookie:", error);
      }
    }
  }

  return null;
}

export default function CombinedProvider({
  children,
  userInfo: initialUserInfo,
}: {
  children: ReactNode;
  userInfo?: UserInfo | null;
}) {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(() =>
    getInitialUserInfo(initialUserInfo),
  );

  // 쿠키 변경을 감지하여 업데이트 (로그인/로그아웃 시)
  useEffect(() => {
    const userInfoCookie = cookies.get("user_info");
    if (userInfoCookie) {
      try {
        const parsedUserInfo = JSON.parse(userInfoCookie);
        setUserInfo(parsedUserInfo);
      } catch (error) {
        console.error("Failed to parse user_info cookie:", error);
      }
    } else if (!initialUserInfo) {
      // 쿠키가 없고 서버에서도 없으면 null로 설정
      setUserInfo(null);
    }
  }, [initialUserInfo]);

  return (
    <QueryClientProvider client={queryClient}>
      <UserContext.Provider value={userInfo}>{children}</UserContext.Provider>
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
}
