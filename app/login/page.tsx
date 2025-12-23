"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MainContainer from "../components/MainContainer";
import PageHeader from "../components/PageHeader";
import { authService } from "../utils/auth";

// 테스트 계정
// {
//   "memberId": "user",
//   "password": "password123"
// }

// {
//   "memberId": "academy",
//   "password": "password123"
// }
export default function LoginPage() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [isIdFocused, setIsIdFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 앱 기반: 토큰이 있으면 자동 로그인 처리
  useEffect(() => {
    const checkAndRedirect = async () => {
      let userInfo = authService.getCurrentUserInfo();
      const { tokenManager } = await import("../utils/cookies");
      const hasAccessToken = !!tokenManager.getAccessToken();
      const hasRefreshToken = !!tokenManager.getRefreshToken();

      console.log("🔍 [로그인 페이지] 토큰 상태:", {
        hasAccessToken,
        hasRefreshToken,
        hasUserInfo: !!userInfo,
      });

      // 1. 액세스 토큰 + user_info 있으면 바로 리다이렉트
      if (userInfo && hasAccessToken) {
        console.log("✅ [조건1] 이미 로그인된 사용자 - 자동 이동:", userInfo);
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
        setIsLoading(true);

        const refreshResult = await authService.refreshToken();

        if (refreshResult.success) {
          console.log("✅ 토큰 갱신 성공");

          // 갱신 후 쿠키에서 user_info 확인
          userInfo = authService.getCurrentUserInfo();
          console.log("🔍 쿠키에서 user_info 확인:", userInfo);

          if (userInfo) {
            console.log("✅ user_info 있음 - 자동 이동");
            redirectByRole(userInfo.role);
            setIsLoading(false);
            return;
          } else {
            console.error("❌ user_info 없음 - 로그인 페이지 유지");
            const { tokenManager } = await import("../utils/cookies");
            tokenManager.clearTokens();
          }
        } else {
          console.error("❌ 토큰 갱신 실패 - 로그인 페이지 유지");
          const { tokenManager } = await import("../utils/cookies");
          tokenManager.clearTokens();
        }

        setIsLoading(false);
      }
    };

    const redirectByRole = (role: string) => {
      // 페이지를 완전히 새로고침하여 쿠키 정보가 제대로 로드되도록 함
      if (role === "USER") {
        window.location.href = "/parent";
      } else if (role === "ACADEMY") {
        window.location.href = "/academy";
      } else if (role === "TEMP") {
        window.location.href = "/signup/role";
      } else if (role === "TEMP_ACADEMY") {
        window.location.href = "/signup/academy/onboarding";
      } else if (role === "TEMP_USER") {
        window.location.href = "/signup/parent/onboarding";
      }
    };

    checkAndRedirect();
  }, [router]);

  const handleLogin = async () => {
    if (!id.trim() || !password.trim()) {
      setError("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await authService.login({
        memberId: id.trim(),
        password: password,
      });

      if (result.success) {
        // 로그인 성공 - 사용자 정보는 이미 쿠키에 저장됨
        const userInfo = authService.getCurrentUserInfo();
        console.log("로그인된 사용자 정보:", userInfo);

        // 페이지를 완전히 새로고침하여 쿠키 정보가 제대로 로드되도록 함
        if (result.data?.data.role === "USER") {
          window.location.href = "/parent";
        } else if (result.data?.data.role === "ACADEMY") {
          window.location.href = "/academy";
        } else if (result.data?.data.role === "TEMP") {
          window.location.href = "/signup/role";
        } else if (result.data?.data.role === "TEMP_ACADEMY") {
          window.location.href = "/signup/academy/onboarding";
        } else if (result.data?.data.role === "TEMP_USER") {
          window.location.href = "/signup/parent/onboarding";
        }
      } else {
        setError(result.error || "로그인에 실패했습니다.");
      }
    } catch (error) {
      console.error("로그인 오류:", error);
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainContainer>
      {/* Close 버튼 영역 */}
      <PageHeader variant="close" />

      {/* 제목 영역 */}
      <div className="pt-[62px] pb-[92px]">
        <h1 className="text-[25px] font-bold text-gray-900 leading-[30px] text-center">
          로그인을 해주세요!
        </h1>
      </div>

      {/* 입력 필드 영역 */}
      <div className="flex-1 flex flex-col">
        {/* 첫 번째 입력 필드 */}
        <div>
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            onFocus={() => setIsIdFocused(true)}
            onBlur={() => setIsIdFocused(false)}
            placeholder="아이디를 입력해주세요"
            className={`w-full h-[59px] border-[1.5px] rounded-[7px] px-5 text-[16px] font-medium outline-none transition-colors ${
              isIdFocused || id ? "border-[#3f55ff]" : "border-[#d2d2d2]"
            } placeholder:text-[#d2d2d2] placeholder:font-medium`}
          />
        </div>

        {/* 두 번째 입력 필드 */}
        <div className="mt-2">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setIsPasswordFocused(true)}
            onBlur={() => setIsPasswordFocused(false)}
            placeholder="비밀번호를 입력해주세요"
            className={`w-full h-[59px] border-[1.5px] rounded-[7px] px-5 text-[16px] font-medium outline-none transition-colors ${
              isPasswordFocused || password
                ? "border-[#3f55ff]"
                : "border-[#d2d2d2]"
            } placeholder:text-[#d2d2d2] placeholder:font-medium`}
          />
        </div>

        {/* 로그인 버튼 */}
        <div className="mt-6">
          <button
            onClick={handleLogin}
            disabled={isLoading || !id.trim() || !password.trim()}
            className={`w-full h-[59px] rounded-[7px] flex items-center justify-center transition-colors ${
              isLoading || !id.trim() || !password.trim()
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-[#3f55ff] hover:bg-[#3646e6] cursor-pointer"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                <span className="font-semibold text-white text-[16px]">
                  로그인 중...
                </span>
              </div>
            ) : (
              <span className="font-semibold text-white text-[16px]">
                로그인
              </span>
            )}
          </button>
        </div>

        {/* 아이디, 비밀번호 찾기 영역 */}
        <div className="flex justify-center items-center mt-6 gap-[6px] w-full">
          <button
            className="text-[#B4B4B4] text-[13px]"
            onClick={() => router.push("/find/id")}
          >
            아이디 찾기
          </button>
          <svg
            width="2"
            height="2"
            viewBox="0 0 2 2"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="1" cy="1" r="1" fill="#D9D9D9" />
          </svg>

          <button
            className="text-[#B4B4B4] text-[13px]"
            onClick={() => router.push("/find/password")}
          >
            비밀번호 찾기
          </button>
        </div>
      </div>
    </MainContainer>
  );
}
