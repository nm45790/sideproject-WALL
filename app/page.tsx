"use client";

import { useEffect, useState } from "react";
import MainContainer from "./components/MainContainer";
import Splash from "./components/Splash";
import { useRouter } from "next/navigation";
import { authService } from "./utils/auth";

export default function Home() {
  const router = useRouter();

  // 하이드레이션 에러 방지를 위해 초기값은 false
  const [showSplash, setShowSplash] = useState(false);
  const [splashFading, setSplashFading] = useState(false);
  const [mainVisible, setMainVisible] = useState(false);

  // 클라이언트 사이드에서 세션 스토리지 체크
  useEffect(() => {
    const hasShownSplash = sessionStorage.getItem("hasShownSplash");
    if (!hasShownSplash) {
      setShowSplash(true);
    } else {
      setMainVisible(true);
    }
  }, []);

  useEffect(() => {
    if (showSplash) {
      // 스플래시 표시 중 스크롤 방지
      document.body.style.overflow = "hidden";

      // 스플래시 fade out 타이머
      const fadeOutTimer = setTimeout(() => {
        setSplashFading(true);
      }, 900);

      // 메인 콘텐츠 표시 타이머
      const mainTimer = setTimeout(() => {
        setMainVisible(true);
        setShowSplash(false);
        document.body.style.overflow = ""; // 스크롤 복원
        sessionStorage.setItem("hasShownSplash", "true"); // 세션에 저장
      }, 1400); // fade out 완료 후

      return () => {
        clearTimeout(fadeOutTimer);
        clearTimeout(mainTimer);
        document.body.style.overflow = ""; // cleanup
      };
    }
  }, [showSplash]);

  // 로그인 상태 체크
  useEffect(() => {
    const checkAndRedirect = async () => {
      let userInfo = authService.getCurrentUserInfo();
      const { tokenManager } = await import("./utils/cookies");
      const hasAccessToken = !!tokenManager.getAccessToken();
      const hasRefreshToken = !!tokenManager.getRefreshToken();
      console.log(userInfo?.role);

      console.log("🔍 [메인 페이지] 토큰 상태:", {
        hasAccessToken,
        hasRefreshToken,
        hasUserInfo: !!userInfo,
      });

      // 1. 액세스 토큰 + user_info 있으면 바로 리다이렉트
      if (userInfo && hasAccessToken) {
        console.log("✅ [조건1] 토큰과 사용자 정보 있음 - 자동 이동");
        redirectByRole(userInfo.role);
        return;
      }

      // 2. 액세스 토큰 있고 user_info 없으면 → 토큰에서 role 추출해서 자동 로그인
      if (!userInfo && hasAccessToken) {
        console.log(
          "🔄 [조건2] 토큰은 있지만 user_info 없음 - 토큰에서 정보 추출",
        );
        const tokenInfo = authService.getUserInfoFromToken();
        if (tokenInfo) {
          console.log(
            "✅ 토큰에서 role 추출 성공 - 자동 이동:",
            tokenInfo.role,
          );
          redirectByRole(tokenInfo.role);
          return;
        }
      }

      // 3. 액세스 토큰 없고 리프레시 토큰만 있으면 → 토큰 갱신 후 user_info 확인
      if (!hasAccessToken && hasRefreshToken) {
        console.log("🔄 [조건3] 리프레시 토큰만 있음 - 토큰 갱신 시도");
        const refreshResult = await authService.refreshToken();

        if (refreshResult.success) {
          console.log("✅ 토큰 갱신 성공");

          // 갱신 후 쿠키에서 user_info 확인
          userInfo = authService.getCurrentUserInfo();
          console.log("🔍 쿠키에서 user_info 확인:", userInfo);

          if (userInfo) {
            console.log("✅ user_info 있음 - 자동 이동");
            redirectByRole(userInfo.role);
            return;
          } else {
            console.error("❌ user_info 없음 - 로그인 필요");
            authService.logout();
          }
        } else {
          console.error("❌ 토큰 갱신 실패 - 로그인 필요");
          authService.logout();
        }
      }
    };

    const redirectByRole = (role: string) => {
      if (role === "USER") {
        router.push("/parent");
      } else if (role === "ACADEMY") {
        router.push("/academy");
      } else if (role === "TEMP") {
        router.push("/signup/role");
      } else if (role === "TEMP_ACADEMY") {
        router.push("/signup/academy/onboarding");
      } else if (role === "TEMP_USER") {
        router.push("/signup/parent/onboarding");
      }
    };

    checkAndRedirect();
  }, [router]);

  return (
    <div className="w-full h-dvh overflow-hidden">
      {/* 메인 콘텐츠 */}
      <div
        className={`transition-all duration-700 ease-out ${
          mainVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        } w-full flex justify-center h-full`}
      >
        <MainContainer>
          <div className="bg-white relative w-full min-h-dvh px-5 flex flex-col">
            {/* 상단 콘텐츠 영역 */}
            <div className="pt-[108px] flex-1">
              {/* 메인 타이틀 */}
              <div className="relative">
                <h1 className="font-bold leading-normal text-gray-900 text-[20px]">
                  <span className="relative">
                    반려견 케어스페이스
                    {/* 노란색 하이라이트 */}
                    <div className="absolute bg-[#f4ff5d] h-[13px] w-[120px] -bottom-1 right-0 opacity-50" />
                  </span>
                  <br />
                  예약·관리 플랫폼
                </h1>
              </div>

              {/* 서브 타이틀 */}
              <p className="font-medium text-[#858585] text-[13px] mt-[50px]">
                유치원, 호텔, 놀이방 등 다양한 공간을 한 곳에서 간편하게
              </p>
            </div>

            {/* 하단 버튼 영역 */}
            <div className="pb-8 space-y-4">
              {/* 왈 아이디로 로그인 버튼 */}
              <button
                className="w-full bg-[#3f55ff] h-[59px] rounded-[7px] flex items-center justify-center cursor-pointer hover:bg-[#3646e6] transition-colors"
                onClick={() => router.push("/login")}
              >
                <span className="font-semibold text-white text-[16px]">
                  왈 아이디로 로그인
                </span>
              </button>

              {/* 왈 아이디로 회원가입 버튼 */}
              <div className="flex items-center justify-center py-3">
                <button
                  className="relative cursor-pointer"
                  onClick={() => router.push("/signup/terms")}
                >
                  <span className="font-semibold text-gray-900 text-[16px] hover:text-[#2a3238] transition-colors relative">
                    왈 아이디로 회원가입
                    <div className="absolute border-gray-900 border-[0px_0px_1px] border-solid bottom-[-0.5px] left-0 right-0" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </MainContainer>
      </div>

      {/* 스플래시 오버레이 */}
      {showSplash && (
        <div
          className={`fixed inset-0 z-50 transition-opacity duration-500 ease-out ${
            splashFading ? "opacity-0" : "opacity-100"
          }`}
          style={{ pointerEvents: splashFading ? "none" : "auto" }}
        >
          <Splash />
        </div>
      )}
    </div>
  );
}
