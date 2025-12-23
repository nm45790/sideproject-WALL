"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import MainContainer from "../../../components/MainContainer";
import Icons from "../../../components/Icons";
import { useSignupStore } from "../../../store/signupStore";
import { authService } from "../../../utils/auth";

export default function AcademyInfoPage() {
  const router = useRouter();
  const {
    signupData,
    updateAcademyName,
    updateAcademyAddress,
    updateAcademyAddressDetail,
    updateSggCode,
    isAcademyOnboardingCompleted,
  } = useSignupStore();

  const [academyName, setAcademyName] = useState(signupData.academyName || "");
  const [address, setAddress] = useState(signupData.academyAddress || "");
  const [addressDetail, setAddressDetail] = useState(
    signupData.academyAddressDetail || "",
  );
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isAddressFocused, setIsAddressFocused] = useState(false);
  const [isAddressDetailFocused, setIsAddressDetailFocused] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);

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

  // 주소 선택 완료 처리
  const handleAddressSelect = useCallback(
    (data: any) => {
      try {
        console.log("handleAddressSelect 호출됨:", data);

        // 주소 정보 설정 - roadAddress 또는 address 사용
        const fullAddress = data.roadAddress || data.address || "";
        console.log("설정할 주소:", fullAddress);

        setAddress(fullAddress);
        updateAcademyAddress(fullAddress);

        // 시군구 코드 설정 - bcode 사용
        const sggCode = data.bcode || "";
        console.log("설정할 시군구 코드:", sggCode);
        updateSggCode(sggCode);

        // 모달 닫기
        setShowAddressModal(false);

        // 상세주소 입력 필드에 포커스
        setTimeout(() => {
          const addressDetailInput = document.getElementById("addressDetail");
          if (addressDetailInput) {
            addressDetailInput.focus();
          }
        }, 100);
      } catch (error) {
        console.error("주소 선택 처리 중 오류:", error);
        setShowAddressModal(false);
      }
    },
    [updateAcademyAddress, updateSggCode],
  );

  // 주소검색 모달이 열릴 때 카카오 주소검색 초기화
  useEffect(() => {
    if (showAddressModal && typeof window !== "undefined" && window.daum) {
      const container = document.getElementById("addressSearchContainer");
      if (container) {
        console.log("카카오 주소검색 초기화 중...");
        new window.daum.Postcode({
          oncomplete: (data: any) => {
            console.log("주소 선택됨:", data);
            handleAddressSelect(data);
          },
          width: "100%",
          height: "100%",
        }).embed(container);
      }
    }
  }, [showAddressModal, handleAddressSelect]);

  // localStorage에서 저장된 값으로 초기값 설정
  useEffect(() => {
    setAcademyName(signupData.academyName || "");
    setAddress(signupData.academyAddress || "");
    setAddressDetail(signupData.academyAddressDetail || "");
  }, [signupData]);

  // 주소 상태 변경 디버깅
  useEffect(() => {
    console.log("주소 상태 변경됨:", address);
  }, [address]);

  const handleGoBack = () => {
    router.back();
  };

  const handleAcademyNameChange = (value: string) => {
    setAcademyName(value);
    updateAcademyName(value);
  };

  const handleAddressDetailChange = (value: string) => {
    setAddressDetail(value);
    updateAcademyAddressDetail(value);
  };

  // 카카오 주소검색 모달 열기
  const openKakaoAddressSearch = () => {
    setShowAddressModal(true);
  };

  // 카카오 주소검색 모달 닫기
  const closeAddressModal = () => {
    setShowAddressModal(false);
  };

  const handleNext = () => {
    if (!academyName?.trim()) {
      alert("사업장명을 입력해주세요.");
      return;
    }
    if (!address?.trim()) {
      alert("주소를 입력해주세요.");
      return;
    }
    if (!addressDetail?.trim()) {
      alert("상세 주소를 입력해주세요.");
      return;
    }

    // 다음 페이지로 이동
    router.push("/signup/academy/phone");
  };

  const isFormValid =
    academyName?.trim() !== "" &&
    address?.trim() !== "" &&
    addressDetail?.trim() !== "";

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
          유치원 정보를 입력해 주세요!
        </h2>
        <p className="text-[16px] text-[#858585]">
          유치원 이름과 주소를 입력해 주세요
        </p>
      </div>

      {/* 입력 필드 영역 */}
      <div className="flex-1 flex flex-col">
        {/* 사업장명 입력 */}
        <div className="mb-[24px]">
          <div className="mb-[8px]">
            <span className="text-[16px] font-medium text-gray-900">
              사업장명
            </span>
            <span className="text-[16px] font-medium text-[#ff2407] ml-1">
              *
            </span>
          </div>
          <input
            type="text"
            value={academyName}
            onChange={(e) => handleAcademyNameChange(e.target.value)}
            onFocus={() => setIsNameFocused(true)}
            onBlur={() => setIsNameFocused(false)}
            placeholder="사업자등록증의 상호명을 입력해주세요"
            className={`w-full h-[59px] border-[1.5px] rounded-[7px] px-5 text-[16px] font-medium outline-none transition-colors ${
              isNameFocused || academyName
                ? "border-[#3f55ff]"
                : "border-[#d2d2d2]"
            } placeholder:text-[#b4b4b4] placeholder:font-medium`}
          />
        </div>

        {/* 주소 입력 */}
        <div className="mb-[24px]">
          <div className="mb-[8px]">
            <span className="text-[16px] font-medium text-gray-900">주소</span>
            <span className="text-[16px] font-medium text-[#ff2407] ml-1">
              *
            </span>
          </div>
          <input
            type="text"
            value={address || ""}
            onClick={openKakaoAddressSearch}
            onFocus={() => setIsAddressFocused(true)}
            onBlur={() => setIsAddressFocused(false)}
            placeholder="주소를 검색해주세요"
            readOnly
            className={`w-full h-[59px] border-[1.5px] rounded-[7px] px-5 text-[16px] font-medium outline-none transition-colors bg-gray-50 cursor-pointer ${
              isAddressFocused || address
                ? "border-[#3f55ff]"
                : "border-[#d2d2d2]"
            } placeholder:text-[#b4b4b4] placeholder:font-medium`}
          />
        </div>

        {/* 상세 주소 입력 */}
        <div className="mb-[25px]">
          <div className="mb-[8px]">
            <span className="text-[16px] font-medium text-gray-900">
              상세 주소
            </span>
            <span className="text-[16px] font-medium text-[#ff2407] ml-1">
              *
            </span>
          </div>
          <input
            id="addressDetail"
            type="text"
            value={addressDetail}
            onChange={(e) => handleAddressDetailChange(e.target.value)}
            onFocus={() => setIsAddressDetailFocused(true)}
            onBlur={() => setIsAddressDetailFocused(false)}
            placeholder="상세 주소를 입력해주세요"
            className={`w-full h-[59px] border-[1.5px] rounded-[7px] px-5 text-[16px] font-medium outline-none transition-colors ${
              isAddressDetailFocused || addressDetail
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

      {/* 주소검색 모달 - 전체 화면 모바일 형태 */}
      {showAddressModal && (
        <div className="fixed inset-0 z-[9999] bg-white">
          {/* 모달 헤더 - 상단 고정 */}
          <div className="flex items-center justify-between px-5 py-4 bg-white border-b border-gray-200">
            <button
              onClick={closeAddressModal}
              className="w-8 h-8 flex items-center justify-center"
            >
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h3 className="text-[18px] font-bold text-gray-900">주소 검색</h3>
            <div className="w-8"></div> {/* 균형 맞추기 */}
          </div>

          {/* 주소검색 컨테이너 - 나머지 공간 전체 사용 */}
          <div
            id="addressSearchContainer"
            className="w-full h-full"
            style={{ height: "calc(100vh - 80px)" }}
          />
        </div>
      )}
    </MainContainer>
  );
}
