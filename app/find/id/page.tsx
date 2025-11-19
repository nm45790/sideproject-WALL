"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MainContainer from "../../components/MainContainer";
import Icons from "../../components/Icons";
import useDebouncedApi from "../../utils/debouncedApi";

export default function FindIdPage() {
  const router = useRouter();
  const api = useDebouncedApi();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoBack = () => {
    router.back();
  };

  const handleNameChange = (value: string) => {
    // 한글과 영어만 허용 (특수문자, 숫자 제거)
    const filteredValue = value.replace(/[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z\s]/g, "");
    setName(filteredValue);
  };

  const formatPhoneNumber = (value: string) => {
    // 숫자만 추출
    const numbers = value.replace(/\D/g, "");

    // 길이에 따라 하이픈 추가
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setPhone(formatted);
  };

  const handleNext = async () => {
    if (!name.trim() || !phone.trim()) {
      return;
    }

    setIsLoading(true);

    try {
      // 아이디 찾기 인증번호 발송
      const phoneNumber = phone.replace(/-/g, "");
      const response = await api.execute({
        url: "/api/v1/members/find-id/send-verification",
        method: "POST",
        data: {
          verfiyType: "phone",
          name: name,
          phone: phoneNumber,
        },
      });

      // 응답 확인: { code: ..., data: { success: true, expiresIn: ..., verificationCode: ... } }
      // 성공하면 (에러가 없으면) 다음 페이지로 이동
      if (response) {
        alert("인증번호가 발송되었습니다.");
        // 이름과 전화번호를 query parameter로 전달
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
        {/* 이름 입력 */}
        <div className="mb-[24px]">
          <div className="mb-[8px]">
            <span className="text-[14px] font-medium text-[#363e4a]">이름</span>
            <span className="text-[14px] font-medium text-[#ff3b30] ml-1">
              *
            </span>
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
            <span className="text-[14px] font-medium text-[#363e4a]">
              전화번호
            </span>
            <span className="text-[14px] font-medium text-[#ff3b30] ml-1">
              *
            </span>
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
