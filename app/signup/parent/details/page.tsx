"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MainContainer from "../../../components/MainContainer";
import Icons from "../../../components/Icons";
import { useSignupStore } from "../../../store/signupStore";
import BreedSelectorModal from "../../../components/BreedSelectorModal";
import DateWheelPicker from "@/app/components/DateWheelPicker";

export default function ParentDetailsPage() {
  const router = useRouter();
  const {
    signupData,
    updatePetBreed,
    updatePetBirthday,
    isParentOnboardingCompleted,
  } = useSignupStore();

  const [breed, setBreed] = useState(signupData.petBreed || "");
  const [birthday, setBirthday] = useState<Date | null>(
    signupData.petBirthday
      ? new Date(
          parseInt(signupData.petBirthday.substring(0, 4)),
          parseInt(signupData.petBirthday.substring(4, 6)) - 1,
          parseInt(signupData.petBirthday.substring(6, 8)),
        )
      : null,
  );

  const [showBreedModal, setShowBreedModal] = useState(false);
  const [showBirthdayModal, setShowBirthdayModal] = useState(false);

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
    setBreed(signupData.petBreed || "");
    if (signupData.petBirthday) {
      const year = parseInt(signupData.petBirthday.substring(0, 4));
      const month = parseInt(signupData.petBirthday.substring(4, 6)) - 1;
      const day = parseInt(signupData.petBirthday.substring(6, 8));
      setBirthday(new Date(year, month, day));
    } else {
      setBirthday(null);
    }
  }, [signupData]);

  const handleGoBack = () => {
    router.back();
  };

  const handleBreedSelect = (selectedBreed: string) => {
    setBreed(selectedBreed);
    updatePetBreed(selectedBreed);
  };

  const handleBirthdaySelect = (selectedDate: Date) => {
    setBirthday(selectedDate);
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    const formattedDate = `${year}${month}${day}`;
    updatePetBirthday(formattedDate);
  };

  const formatBirthdayDisplay = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}년 ${month}월 ${day}일`;
  };

  const handleNext = () => {
    if (!breed?.trim()) {
      alert("견종을 선택해주세요.");
      return;
    }
    if (!birthday || !signupData.petBirthday) {
      alert("생일을 선택해주세요.");
      return;
    }

    // 다음 페이지로 이동
    router.push("/signup/parent/picture");
  };

  const isFormValid =
    breed?.trim() !== "" && birthday !== null && signupData.petBirthday !== "";

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
        <h2 className="text-[25px] font-bold text-gray-900 leading-[30px] mb-2">
          조금 더 알려주세요!
        </h2>
        <p className="text-[16px] text-[#858585]">
          우리아이는 어떤 아이인가요?
        </p>
      </div>

      {/* 입력 필드 영역 */}
      <div className="flex-1 flex flex-col">
        {/* 견종 선택 */}
        <div className="mb-[24px]">
          <div className="mb-[8px]">
            <span className="text-[16px] font-medium text-gray-900">견종</span>
            <span className="text-[16px] font-medium text-[#ff2407] ml-1">
              *
            </span>
          </div>
          <button
            onClick={() => setShowBreedModal(true)}
            className="w-full h-[59px] border border-[#d2d2d2] rounded-[7px] px-5 text-[16px] font-medium outline-none transition-colors text-left"
          >
            <span className={breed ? "text-gray-900" : "text-[#b4b4b4]"}>
              {breed || "견종을 선택해주세요"}
            </span>
          </button>
        </div>

        {/* 생일 선택 */}
        <div className="mb-[25px]">
          <div className="mb-[8px]">
            <span className="text-[16px] font-medium text-gray-900">생일</span>
            <span className="text-[16px] font-medium text-[#ff2407] ml-1">
              *
            </span>
          </div>
          <button
            onClick={() => setShowBirthdayModal(true)}
            className="w-full h-[59px] border border-[#d2d2d2] rounded-[7px] px-5 text-[16px] font-medium outline-none transition-colors text-left"
          >
            <span className={birthday ? "text-gray-900" : "text-[#b4b4b4]"}>
              {birthday
                ? formatBirthdayDisplay(birthday)
                : "생일을 선택해주세요"}
            </span>
          </button>
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

      {/* 견종 선택 모달 */}
      <BreedSelectorModal
        isOpen={showBreedModal}
        onClose={() => setShowBreedModal(false)}
        selectedBreed={breed}
        onBreedSelect={handleBreedSelect}
      />

      {/* 생일 선택 모달 */}
      <DateWheelPicker
        isOpen={showBirthdayModal}
        onClose={() => setShowBirthdayModal(false)}
        selectedDate={birthday || new Date()}
        onDateSelect={handleBirthdaySelect}
        title="반려견 생일 변경"
      />
    </MainContainer>
  );
}
