"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MainContainer from "../../../components/MainContainer";
import Icons from "../../../components/Icons";
import useDebouncedApi from "../../../utils/debouncedApi";
import {
  formatPhoneNumberDisplay,
  formatVerificationCode,
  formatTime,
} from "../../../utils/format";

export default function FindPasswordVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const api = useDebouncedApi();

  const memberId = searchParams.get("memberId") || "";
  const phone = searchParams.get("phone") || "";

  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeFocused, setIsCodeFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 180초(3분)

  // 아이디와 전화번호가 없으면 첫 페이지로 리다이렉트
  useEffect(() => {
    if (!memberId || !phone) {
      alert("잘못된 접근입니다.");
      router.push("/find/password");
    }
  }, [memberId, phone, router]);

  // 페이지 로드 시 자동으로 인증번호 발송
  useEffect(() => {
    if (memberId && phone) {
      handleResendCode();
    }
  }, []);

  // 타이머 효과
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timeLeft]);

  const handleGoBack = () => {
    router.back();
  };

  const handleCodeChange = (value: string) => {
    const numbers = formatVerificationCode(value);
    setVerificationCode(numbers);

    // 6자리 입력 시 자동 검증
    if (numbers.length === 6) {
      handleVerifyCode(numbers);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);

    try {
      const response = await api.execute({
        url: "/api/v1/members/find-password/step1",
        method: "POST",
        data: {
          verfiyType: "phone",
          memberId,
          phone: phone,
        },
      });

      if (response) {
        alert("인증번호가 재발송되었습니다.");
        setTimeLeft(180); // 타이머 재시작 (180초)
        setVerificationCode("");
      }
    } catch (err) {
      // 에러 메시지는 debouncedApi에서 이미 alert으로 표시됨
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (code?: string) => {
    const codeToVerify = code || verificationCode;

    if (!codeToVerify || codeToVerify.length !== 6) {
      alert("6자리 인증번호를 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.execute({
        url: "/api/v1/members/find-password/step2",
        method: "POST",
        data: {
          verfiyType: "phone",
          memberId,
          phone: phone,
          verificationCode: codeToVerify,
        },
      });

      if (response && response.data) {
        router.push(
          `/find/password/result?token=${encodeURIComponent(response.data.resetToken || "")}`,
        );
      }
    } catch (err) {
      // 에러 메시지는 debouncedApi에서 이미 alert으로 표시됨
      setVerificationCode("");
    } finally {
      setIsLoading(false);
    }
  };

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
        {/* 전화번호 표시 */}
        <div className="mb-[68px] text-center">
          <span className="text-[18px] font-medium text-gray-900">
            {formatPhoneNumberDisplay(phone)}
          </span>
        </div>

        {/* 인증번호 입력 */}
        <div className="mb-[24px]">
          <div className="relative">
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => handleCodeChange(e.target.value)}
              onFocus={() => setIsCodeFocused(true)}
              onBlur={() => setIsCodeFocused(false)}
              placeholder="인증번호를 입력해 주세요"
              maxLength={6}
              disabled={isLoading}
              className={`w-full h-[59px] border-[1.5px] rounded-[7px] px-5 pr-[80px] text-[16px] font-medium outline-none transition-colors ${
                isCodeFocused || verificationCode
                  ? "border-[#3f55ff]"
                  : "border-[#d2d2d2]"
              } placeholder:text-[#d2d2d2] placeholder:font-medium bg-white`}
            />
            {/* 타이머 표시 */}
            {timeLeft > 0 && (
              <div className="absolute right-5 top-1/2 -translate-y-1/2">
                <span className="text-[16px] font-semibold text-[#FA2929]">
                  {formatTime(timeLeft)}
                </span>
              </div>
            )}
          </div>

          {/* 재발송 텍스트 버튼 */}
          <div className="mt-[37px] text-center">
            <button
              onClick={handleResendCode}
              disabled={isLoading}
              className={`text-[14px] font-normal border-b transition-colors ${
                isLoading
                  ? "text-gray-400 border-gray-400 cursor-not-allowed"
                  : "text-[#b4b4b4] border-[#b4b4b4] cursor-pointer"
              }`}
            >
              {isLoading ? "발송중..." : "인증번호 다시 받기"}
            </button>
          </div>
        </div>
      </div>
    </MainContainer>
  );
}
