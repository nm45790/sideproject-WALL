"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MainContainer from "../../components/MainContainer";
import Icons from "../../components/Icons";
import useDebouncedRequest from "../../hooks/useDebouncedRequest";
import {
  formatPhoneNumberInput,
  removePhoneNumberHyphens,
} from "../../utils/format";

export default function FindPasswordPage() {
  const router = useRouter();
  const api = useDebouncedRequest();

  const [memberId, setMemberId] = useState("");
  const [phone, setPhone] = useState("");
  const [isMemberIdFocused, setIsMemberIdFocused] = useState(false);
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoBack = () => {
    router.back();
  };

  const handlePhoneChange = (value: string) => {
    setPhone(formatPhoneNumberInput(value));
  };

  const handleNext = async () => {
    if (!memberId.trim() || !phone.trim()) {
      return;
    }

    setIsLoading(true);

    try {
      const phoneNumber = removePhoneNumberHyphens(phone);
      const response = await api.executeImmediately(
        "post",
        "/api/v1/members/find-password/step1",
        {
          verfiyType: "phone",
          memberId,
          phone: phoneNumber,
        },
      );

      if (response) {
        alert("인증번호가 발송되었습니다.");
        router.push(
          `/find/password/verify?memberId=${encodeURIComponent(memberId)}&phone=${encodeURIComponent(phoneNumber)}`,
        );
      }
    } catch (err) {
      // 에러 메시지는 debouncedApi에서 이미 alert으로 표시됨
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = memberId.trim() !== "" && phone.trim() !== "";

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
        <h1 className="absolute top-[64px] text-[18px] font-bold text-[#363e4a] leading-[normal]">
          비밀번호 찾기
        </h1>
      </div>

      {/* 입력 필드 영역 */}
      <div className="flex-1 flex flex-col pt-[88px]">
        {/* 아이디 입력 */}
        <div className="mb-[25px]">
          <div className="mb-[8px]">
            <span className="text-[16px] font-medium text-[#363e4a]">
              아이디
            </span>
            <span className="text-[16px] font-medium text-[#ff2407] ml-1">
              *
            </span>
          </div>
          <input
            type="text"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            onFocus={() => setIsMemberIdFocused(true)}
            onBlur={() => setIsMemberIdFocused(false)}
            placeholder="아이디를 입력해주세요"
            className={`w-full h-[59px] border-[1.5px] rounded-[7px] px-5 text-[16px] font-medium outline-none transition-colors ${
              isMemberIdFocused || memberId
                ? "border-[#3f55ff]"
                : "border-[#d2d2d2]"
            } placeholder:text-[#d2d2d2] placeholder:font-medium bg-white`}
          />
        </div>

        {/* 전화번호 입력 */}
        <div className="mb-[25px]">
          <div className="mb-[8px]">
            <span className="text-[16px] font-medium text-[#363e4a]">
              전화번호
            </span>
            <span className="text-[16px] font-medium text-[#ff2407] ml-1">
              *
            </span>
          </div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            onFocus={() => setIsPhoneFocused(true)}
            onBlur={() => setIsPhoneFocused(false)}
            placeholder="휴대전화 번호를 입력해주세요"
            className={`w-full h-[59px] border-[1.5px] rounded-[7px] px-5 text-[16px] font-medium outline-none transition-colors ${
              isPhoneFocused || phone ? "border-[#3f55ff]" : "border-[#d2d2d2]"
            } placeholder:text-[#d2d2d2] placeholder:font-medium bg-white`}
          />
        </div>

        {/* 인증번호 받기 버튼 */}
        <button
          onClick={handleNext}
          disabled={!isFormValid || isLoading}
          className={`w-full h-[59px] rounded-[7px] flex items-center justify-center transition-colors ${
            isFormValid && !isLoading
              ? "bg-[#3f55ff] hover:bg-[#3646e6] cursor-pointer"
              : "bg-[#f0f0f0] cursor-not-allowed"
          }`}
        >
          <span className="font-semibold text-[16px] text-white">
            {isLoading ? "발송중..." : "인증번호 받기"}
          </span>
        </button>
      </div>
    </MainContainer>
  );
}
