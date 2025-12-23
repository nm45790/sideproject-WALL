"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MainContainer from "../../../components/MainContainer";
import Icons from "../../../components/Icons";
import useDebouncedApi from "../../../utils/debouncedApi";

export default function FindPasswordResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const api = useDebouncedApi();

  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isNewPasswordFocused, setIsNewPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 토큰이 없으면 첫 페이지로 리다이렉트
  useEffect(() => {
    if (!token) {
      alert("잘못된 접근입니다.");
      router.push("/find/password");
    }
  }, [token, router]);

  const handleGoBack = () => {
    router.push("/login");
  };

  const validatePassword = (password: string) => {
    // 비밀번호 유효성 검사 (8자 이상, 영문+숫자+특수문자)
    const regex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    return regex.test(password);
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      alert("새 비밀번호를 입력해주세요.");
      return;
    }

    if (!validatePassword(newPassword)) {
      alert("비밀번호는 8자 이상, 영문+숫자+특수문자를 포함해야 합니다.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.execute({
        url: "/api/v1/members/reset-password",
        method: "POST",
        data: {
          resetToken: token,
          newPassword: newPassword,
        },
      });

      if (response && response.data) {
        // 응답 메시지 표시
        const message =
          response.data.message || "비밀번호가 성공적으로 변경되었습니다.";
        alert(message);
        router.push("/login");
      }
    } catch (err) {
      // 에러 메시지는 debouncedApi에서 이미 alert으로 표시됨
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    newPassword !== "" &&
    confirmPassword !== "" &&
    newPassword === confirmPassword &&
    validatePassword(newPassword);

  return (
    <MainContainer bg="white">
      {/* 헤더 영역 - 뒤로가기 + 제목 */}
      <div className="relative flex items-center justify-center h-[93px]">
        <button
          onClick={handleGoBack}
          className="absolute left-0 top-[63px] w-[26px] h-[22px] flex items-center justify-center"
        >
          <Icons.Prev className="w-[26px] h-[22px]" />
        </button>
        <h1 className="absolute top-[64px] text-[18px] font-bold text-gray-900 leading-[normal]">
          비밀번호 찾기
        </h1>
      </div>

      {/* 입력 필드 영역 */}
      <div className="flex-1 flex flex-col pt-[38px]">
        {/* 새 비밀번호 입력 */}
        <div className="mb-[25px]">
          <div className="mb-[8px]">
            <span className="text-[16px] font-medium text-gray-900">
              새 비밀번호 등록
            </span>
          </div>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              onFocus={() => setIsNewPasswordFocused(true)}
              onBlur={() => setIsNewPasswordFocused(false)}
              placeholder="새 비밀번호를 입력해주세요"
              className={`w-full h-[59px] border-[1.5px] rounded-[7px] px-5 pr-12 text-[16px] font-medium outline-none transition-colors ${
                isNewPasswordFocused || newPassword
                  ? "border-[#3f55ff]"
                  : "border-[#d2d2d2]"
              } placeholder:text-[#b4b4b4] placeholder:font-medium bg-white`}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-[#B4B4B4]"
            >
              {showNewPassword ? (
                <Icons.EyeOpen className="w-5 h-5" />
              ) : (
                <Icons.EyeClose className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* 비밀번호 확인 입력 */}
        <div className="mb-[24px]">
          <div className="mb-[8px]">
            <span className="text-[16px] font-medium text-gray-900">
              새 비밀번호 재입력
            </span>
          </div>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onFocus={() => setIsConfirmPasswordFocused(true)}
              onBlur={() => setIsConfirmPasswordFocused(false)}
              placeholder="동일한 새 비밀번호를 입력해주세요"
              className={`w-full h-[59px] border-[1.5px] rounded-[7px] px-5 pr-12 text-[16px] font-medium outline-none transition-colors ${
                isConfirmPasswordFocused || confirmPassword
                  ? "border-[#3f55ff]"
                  : "border-[#d2d2d2]"
              } placeholder:text-[#b4b4b4] placeholder:font-medium bg-white`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-[#B4B4B4]"
            >
              {showConfirmPassword ? (
                <Icons.EyeOpen className="w-5 h-5" />
              ) : (
                <Icons.EyeClose className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* 비밀번호 설정 안내 링크 */}
        <div className="mb-[33px] text-right">
          <button className="text-[14px] font-normal text-[#b4b4b4] border-b border-[#b4b4b4]">
            비밀번호 설정 안내
          </button>
        </div>

        {/* 확인 버튼 */}
        <button
          onClick={handleResetPassword}
          disabled={!isFormValid || isLoading}
          className={`w-full h-[59px] rounded-[7px] flex items-center justify-center transition-colors ${
            isFormValid && !isLoading
              ? "bg-[#3f55ff] hover:bg-[#3646e6] cursor-pointer"
              : "bg-[#f0f0f0] cursor-not-allowed"
          }`}
        >
          <span className="font-semibold text-[16px] text-white">
            {isLoading ? "처리중..." : "확인"}
          </span>
        </button>
      </div>
    </MainContainer>
  );
}
