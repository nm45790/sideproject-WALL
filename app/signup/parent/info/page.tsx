"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MainContainer from "../../../components/MainContainer";
import Icons from "../../../components/Icons";
import { useSignupStore } from "../../../store/signupStore";

export default function ParentInfoPage() {
  const router = useRouter();
  const {
    signupData,
    updatePetName,
    updatePetGender,
    isParentOnboardingCompleted,
  } = useSignupStore();

  const [petName, setPetName] = useState(signupData.petName || "");
  const [petGender, setPetGender] = useState(signupData.petGender || "");
  const [isNameFocused, setIsNameFocused] = useState(false);

  // 접근권한 체크
  useEffect(() => {
    // 강아지 추가 모드면 온보딩 체크 건너뜀
    if (signupData.isAddingPet) {
      return;
    }

    // 온보딩 완료 여부 체크
    if (!isParentOnboardingCompleted()) {
      alert("잘못된 접근입니다.");
      router.push("/");
    }
  }, [router, isParentOnboardingCompleted, signupData.isAddingPet]);

  // localStorage에서 저장된 값으로 초기값 설정
  useEffect(() => {
    setPetName(signupData.petName || "");
    setPetGender(signupData.petGender || "");
  }, [signupData]);

  const handleGoBack = () => {
    router.back();
  };

  const handlePetNameChange = (value: string) => {
    // 1~8자 제한
    if (value.length <= 8) {
      setPetName(value);
      updatePetName(value);
    }
  };

  const handleGenderSelect = (gender: string) => {
    setPetGender(gender);
    updatePetGender(gender);
  };

  const handleNext = () => {
    if (!petName?.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }
    if (!petGender) {
      alert("성별을 선택해주세요.");
      return;
    }

    router.push("/signup/parent/details");
  };

  const isFormValid = petName?.trim() !== "" && petGender !== "";

  return (
    <MainContainer>
      {/* 헤더 영역 - 뒤로가기만 */}
      <div className="flex items-center pt-[45px] pb-[20px]">
        <button
          onClick={handleGoBack}
          className="p-[18px] w-[57px] h-[57px] flex items-center justify-center -ml-[18px]"
        >
          <Icons.Prev className="w-[26px] h-[22px]" />
        </button>
      </div>

      {/* 타이틀 영역 */}
      <div className="pt-[32px] pb-[28px]">
        <h2 className="text-[25px] font-bold text-[#363e4a] leading-[30px] mb-2">
          우리아이 정보를 입력해주세요!
        </h2>
        <p className="text-[16px] text-[#858585]">이름과 성별을 입력해주세요</p>
      </div>

      {/* 입력 필드 영역 */}
      <div className="flex-1 flex flex-col">
        {/* 이름 입력 */}
        <div className="mb-[24px]">
          <div className="mb-[8px]">
            <span className="text-[16px] font-medium text-[#363e4a]">이름</span>
            <span className="text-[16px] font-medium text-[#ff2407] ml-1">
              *
            </span>
          </div>
          <input
            type="text"
            value={petName}
            onChange={(e) => handlePetNameChange(e.target.value)}
            onFocus={() => setIsNameFocused(true)}
            onBlur={() => setIsNameFocused(false)}
            placeholder="1~8자로 입력해주세요"
            maxLength={8}
            className={`w-full h-[59px] border-[1.5px] rounded-[7px] px-5 text-[16px] font-medium outline-none transition-colors ${
              isNameFocused || petName ? "border-[#3f55ff]" : "border-[#d2d2d2]"
            } placeholder:text-[#b4b4b4] placeholder:font-medium`}
          />
        </div>

        {/* 성별 선택 */}
        <div className="mb-[25px]">
          <div className="mb-[8px]">
            <span className="text-[16px] font-medium text-[#363e4a]">성별</span>
            <span className="text-[16px] font-medium text-[#ff2407] ml-1">
              *
            </span>
          </div>
          <div className="flex gap-[9px]">
            <button
              onClick={() => handleGenderSelect("MALE")}
              className={`flex-1 h-[59px] rounded-[7px] flex items-center justify-center transition-colors ${
                petGender === "MALE" ? "bg-[#e9fbff]" : "bg-[#f0f0f0]"
              }`}
            >
              <span
                className={`text-[16px] font-medium ${
                  petGender === "MALE" ? "text-[#3f55ff]" : "text-[#d2d2d2]"
                }`}
              >
                남아
              </span>
            </button>
            <button
              onClick={() => handleGenderSelect("FEMALE")}
              className={`flex-1 h-[59px] rounded-[7px] flex items-center justify-center transition-colors ${
                petGender === "FEMALE" ? "bg-[#ffeaef]" : "bg-[#f0f0f0]"
              }`}
            >
              <span
                className={`text-[16px] font-medium ${
                  petGender === "FEMALE" ? "text-[#ff3f52]" : "text-[#d2d2d2]"
                }`}
              >
                여아
              </span>
            </button>
          </div>
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
