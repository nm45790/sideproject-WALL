"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MainContainer from "../../components/MainContainer";
import PageHeader from "../../components/PageHeader";
import useDebouncedApi from "../../utils/debouncedApi";
import {
  formatPhoneNumberInput,
  formatName,
  removePhoneNumberHyphens,
} from "../../utils/format";

export default function FindIdPage() {
  const router = useRouter();
  const api = useDebouncedApi();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleNameChange = (value: string) => {
    setName(formatName(value));
  };

  const handlePhoneChange = (value: string) => {
    setPhone(formatPhoneNumberInput(value));
  };

  const handleNext = async () => {
    if (!name.trim() || !phone.trim()) {
      return;
    }

    setIsLoading(true);

    try {
      const phoneNumber = removePhoneNumberHyphens(phone);
      const response = await api.execute({
        url: "/api/v1/members/find-id/send-verification",
        method: "POST",
        data: {
          verfiyType: "phone",
          name: name,
          phone: phoneNumber,
        },
      });

      if (response) {
        alert("인증번호가 발송되었습니다.");
        router.push(
          `/find/id/verify?name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phoneNumber)}`,
        );
      }
    } catch (err) {
      // 에러 메시지는 debouncedApi에서 이미 alert으로 표시됨
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = name.trim() !== "" && phone.trim() !== "";

  return (
    <MainContainer>
      <PageHeader title="아이디 찾기" />

      {/* 입력 필드 영역 */}
      <div className="flex-1 flex flex-col pt-[38px]">
        {/* 이름 입력 */}
        <div className="mb-[24px]">
          <div className="mb-[8px]">
            <span className="font-medium text-gray-900">이름</span>
            <span className="font-medium text-[#ff3b30]">*</span>
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            onFocus={() => setIsNameFocused(true)}
            onBlur={() => setIsNameFocused(false)}
            placeholder="이름을 입력해주세요"
            className={`w-full h-[59px] border-[1.5px] rounded-[7px] px-5 text-[16px] font-medium outline-none transition-colors ${
              isNameFocused || name ? "border-[#3f55ff]" : "border-[#d2d2d2]"
            } placeholder:text-[#d2d2d2] placeholder:font-medium`}
          />
        </div>

        {/* 전화번호 입력 */}
        <div className="mb-[24px]">
          <div className="mb-[8px]">
            <span className="font-medium text-gray-900">전화번호</span>
            <span className="font-medium text-[#ff3b30] ml-1">*</span>
          </div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            onFocus={() => setIsPhoneFocused(true)}
            onBlur={() => setIsPhoneFocused(false)}
            placeholder="전화번호를 입력해주세요"
            className={`w-full h-[59px] border-[1.5px] rounded-[7px] px-5 text-[16px] font-medium outline-none transition-colors ${
              isPhoneFocused || phone ? "border-[#3f55ff]" : "border-[#d2d2d2]"
            } placeholder:text-[#d2d2d2] placeholder:font-medium`}
          />
        </div>

        {/* 다음 버튼 */}
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
            {isLoading ? "발송중..." : "다음"}
          </span>
        </button>
      </div>
    </MainContainer>
  );
}
