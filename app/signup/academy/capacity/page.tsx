"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MainContainer from "../../../components/MainContainer";
import Icons from "../../../components/Icons";
import { useSignupStore } from "../../../store/signupStore";
import { authService } from "../../../utils/auth";

export default function AcademyCapacityPage() {
  const router = useRouter();
  const { signupData, updateMaxCapacity, isAcademyOnboardingCompleted } =
    useSignupStore();

  const [capacity, setCapacity] = useState("");
  const [isCapacityFocused, setIsCapacityFocused] = useState(false);

  const userInfo = authService.getCurrentUserInfo();

  // 접근권한 체크
  useEffect(() => {
    if (!userInfo) {
      alert("잘못된 접근입니다.");
      router.push("/");
      return;
    }

    // 온보딩 완료 여부 체크
    if (!isAcademyOnboardingCompleted()) {
      alert("잘못된 접근입니다.");
      router.push("/");
    }
  }, [router, userInfo, isAcademyOnboardingCompleted]);

  // signupStore에서 저장된 값으로 초기값 설정
  useEffect(() => {
    if (signupData.maxCapacity && signupData.maxCapacity > 0) {
      setCapacity(signupData.maxCapacity.toString());
    }
  }, [signupData]);

  const handleGoBack = () => {
    router.back();
  };

  const formatCapacity = (value: string) => {
    // 숫자만 추출
    const numbers = value.replace(/\D/g, "");
    return numbers;
  };

  const handleCapacityChange = (value: string) => {
    const formatted = formatCapacity(value);
    setCapacity(formatted);
    // 빈 문자열이면 0으로, 아니면 숫자로 변환
    updateMaxCapacity(formatted === "" ? 0 : parseInt(formatted));
  };

  const handleNext = () => {
    if (!capacity?.trim() || parseInt(capacity) <= 0) {
      alert("정원을 입력해주세요.");
      return;
    }

    router.push("/signup/academy/picture");
  };

  const isFormValid = capacity !== "" && parseInt(capacity) > 0;

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
      </div>

      {/* 입력 필드 영역 */}
      <div className="flex-1 flex flex-col pt-[38px]">
        {/* 제목 */}
        <div className="mb-[8px]">
          <h2 className="text-[25px] font-bold text-gray-900 leading-[30px] mb-[8px]">
            일일 등원 정원이 어떻게 되나요?
          </h2>
          <p className="text-[16px] font-medium text-[#858585] leading-[20px]">
            하루에 돌볼 수 있는 반려견 수를 입력해주세요
          </p>
        </div>

        {/* 정원 입력 */}
        <div className="mb-[25px] mt-[53px]">
          <div className="mb-[8px]">
            <span className="text-[16px] font-medium text-gray-900">정원</span>
            <span className="text-[16px] font-medium text-[#ff2407] ml-1">
              *
            </span>
          </div>
          <input
            type="tel"
            value={capacity}
            onChange={(e) => handleCapacityChange(e.target.value)}
            onFocus={() => setIsCapacityFocused(true)}
            onBlur={() => setIsCapacityFocused(false)}
            placeholder="숫자로 입력해주세요"
            className={`w-full h-[59px] border-[1.5px] rounded-[7px] px-5 text-[16px] font-medium outline-none transition-colors ${
              isCapacityFocused || capacity
                ? "border-[#3f55ff]"
                : "border-[#d2d2d2]"
            } placeholder:text-[#b4b4b4] placeholder:font-medium`}
          />
        </div>

        {/* 다음 버튼 */}
        <button
          onClick={handleNext}
          disabled={!isFormValid}
          className={`w-full h-[59px] rounded-[7px] flex items-center justify-center transition-colors ${
            isFormValid
              ? "bg-[#3f55ff] hover:bg-[#3646e6] cursor-pointer"
              : "bg-[#f0f0f0] cursor-not-allowed"
          }`}
        >
          <span className="font-semibold text-[16px] text-white">다음</span>
        </button>
      </div>
    </MainContainer>
  );
}
