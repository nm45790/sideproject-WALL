"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MainContainer from "../../../components/MainContainer";
import Icons from "../../../components/Icons";
import useDebouncedApi from "../../../utils/debouncedApi";

export default function FindIdVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const api = useDebouncedApi();

  const name = searchParams.get("name") || "";
  const phone = searchParams.get("phone") || "";

  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeFocused, setIsCodeFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5분

  // 이름과 전화번호가 없으면 첫 페이지로 리다이렉트
  useEffect(() => {
    if (!name || !phone) {
      alert("잘못된 접근입니다.");
      router.push("/find/id");
    }
  }, [name, phone, router]);

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
    // 숫자만 입력 허용 (6자리)
    const numbers = value.replace(/\D/g, "").slice(0, 6);
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
        url: "/api/v1/members/find-id/send-verification",
        method: "POST",
        data: {
          verfiyType: "phone",
          name: name,
          phone: phone,
        },
      });

      // 응답 확인: { code: ..., data: { success: true, expiresIn: ..., verificationCode: ... } }
      // 성공하면 (에러가 없으면) 타이머 재시작
      if (response) {
        alert("인증번호가 재발송되었습니다.");
        setTimeLeft(300); // 타이머 재시작
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
      // 아이디 찾기 API 호출 (인증번호 검증 + 아이디 조회)
      const response = await api.execute({
        url: "/api/v1/members/find-id",
        method: "POST",
        data: {
          verfiyType: "phone",
          name: name,
          phone: phone,
          verificationCode: codeToVerify,
        },
      });

      // 응답 확인: { code: ..., data: { memberId: "user123", memberName: "홍길동" } }
      if (response && response.data) {
        // 결과 페이지로 이동 (찾은 아이디를 query parameter로 전달)
        router.push(
          `/find/id/result?memberId=${encodeURIComponent(response.data.memberId || "")}&memberName=${encodeURIComponent(response.data.memberName || "")}`,
        );
      }
    } catch (err) {
      // 에러 메시지는 debouncedApi에서 이미 alert으로 표시됨
      setVerificationCode("");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatPhoneNumber = (phoneNumber: string) => {
    if (phoneNumber.length === 11) {
      return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 7)}-${phoneNumber.slice(7, 11)}`;
    }
    return phoneNumber;
  };

  return (
    <MainContainer>
      {/* 헤더 영역 - 뒤로가기 + 제목 */}
      <div className="flex items-center pt-[45px] pb-[20px]">
        <button
          onClick={handleGoBack}
          className="p-[18px] w-[57px] h-[57px] flex items-center justify-center -ml-[18px]"
        >
          <Icons.Prev className="w-[26px] h-[22px]" />
        </button>
        <h1 className="text-[25px] font-bold text-[#363e4a] leading-[30px] ml-4">
          아이디 찾기
        </h1>
      </div>

      {/* 입력 필드 영역 */}
      <div className="flex-1 flex flex-col pt-[46px]">
        {/* 전화번호 표시 */}
        <div className="mb-[24px]">
          <div className="w-full h-[59px] rounded-[7px] px-5 flex items-center justify-center">
            <span className="text-[16px] font-medium text-[#363e4a]">
              {formatPhoneNumber(phone)}
            </span>
          </div>
        </div>

        {/* 인증번호 입력 */}
        <div className="mb-[24px]">
          <div className="mb-[8px]">
            <span className="text-[14px] font-medium text-[#363e4a]">
              인증번호
            </span>
            <span className="text-[14px] font-medium text-[#ff3b30] ml-1">
              *
            </span>
          </div>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => handleCodeChange(e.target.value)}
            onFocus={() => setIsCodeFocused(true)}
            onBlur={() => setIsCodeFocused(false)}
            placeholder="인증번호 6자리를 입력해주세요"
            maxLength={6}
            disabled={isLoading}
            className={`w-full h-[59px] border-[1.5px] rounded-[7px] px-5 text-[16px] font-medium outline-none transition-colors ${
              isCodeFocused || verificationCode
                ? "border-[#3f55ff]"
                : "border-[#d2d2d2]"
            } placeholder:text-[#d2d2d2] placeholder:font-medium`}
          />

          {/* 재발송 텍스트 버튼 */}
          <div className="mt-3 text-center">
            <button
              onClick={handleResendCode}
              disabled={isLoading || timeLeft > 0}
              className={`text-[14px] font-medium underline transition-colors ${
                isLoading || timeLeft > 0
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-[#B4B4B4] cursor-pointer"
              }`}
            >
              {isLoading
                ? "발송중..."
                : timeLeft > 0
                  ? `인증번호 다시 받기 (${formatTime(timeLeft)})`
                  : "인증번호 다시 받기"}
            </button>
          </div>
        </div>
      </div>
    </MainContainer>
  );
}

