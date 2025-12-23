"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MainContainer from "../../components/MainContainer";
import Icons from "../../components/Icons";
import { useAuth } from "../../components/CombinedProvider";
import { api } from "../../utils/api";

interface PetDetail {
  id: number;
  petName: string;
  petBreed: string;
  petGender: string;
  petBirthday: string;
  ownerId: number;
  ownerName: string;
  ownerPhone: string;
  academyId: number | null;
  academyName: string | null;
  academyAddress: string | null;
  academyAddressDetail: string | null;
  academySggCode: string | null;
  academyPhone: string | null;
  petImage: string | null;
  enrollmentStatus: string;
}

const PetDetailPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userInfo = useAuth();
  const [petDetail, setPetDetail] = useState<PetDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 휴대폰 번호 포맷팅 (01012345678 -> 010-1234-5678)
  const formatPhoneNumber = (phone: string) => {
    if (!phone) return "-";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 11) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  // 반려동물 정보 조회
  const fetchPetDetail = async (petId: string) => {
    if (!userInfo?.academyId) return;

    try {
      setIsLoading(true);
      const response = await api.get(
        `/api/v1/academies/${userInfo.academyId}/pets/${petId}`,
      );

      console.log("🐕 반려동물 정보 API 응답:", response);

      if (response.success && response.data && (response.data as any).data) {
        const petData = (response.data as any).data as PetDetail;
        console.log("🐕 파싱된 반려동물 정보:", petData);
        setPetDetail(petData);
      } else {
        console.error("❌ 반려동물 정보 없음");
        setPetDetail(null);
      }
    } catch (error) {
      console.error("반려동물 정보 조회 실패:", error);
      setPetDetail(null);
    } finally {
      setIsLoading(false);
    }
  };

  // petId 쿼리스트링으로부터 데이터 조회
  useEffect(() => {
    const petId = searchParams.get("petId");
    if (petId && userInfo?.academyId) {
      fetchPetDetail(petId);
    }
  }, [searchParams, userInfo?.academyId]);

  // 보호자에게 전화하기
  const handleCallOwner = () => {
    if (petDetail?.ownerPhone) {
      // 전화번호에서 하이픈 제거
      const phoneNumber = petDetail.ownerPhone.replace(/-/g, "");
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  return (
    <MainContainer bg="#ffffff" noPadding>
      <div className="w-full min-h-dvh flex flex-col">
        {/* 상단 고정 헤더 */}
        <div className="bg-white">
          {/* 뒤로가기 버튼 */}
          <div className="pt-[73px] px-[20px] pb-[20px]">
            <button
              onClick={() => router.back()}
              className="hover:opacity-70 transition-opacity"
            >
              <Icons.Prev className="w-[26px] h-[22px]" />
            </button>
          </div>

          {/* 제목 */}
          <div className="px-[20px] pb-[19px] flex items-center gap-[7px]">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect
                width="18"
                height="18"
                rx="9"
                fill="#3F55FF"
                fillOpacity="0.2"
              />
              <path
                d="M9 5L11 7L9 9L7 7L9 5Z"
                fill="#3F55FF"
                stroke="#3F55FF"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5 9L7 11L5 13L3 11L5 9Z"
                fill="#3F55FF"
                stroke="#3F55FF"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13 9L15 11L13 13L11 11L13 9Z"
                fill="#3F55FF"
                stroke="#3F55FF"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="font-bold text-gray-900 text-[16px] leading-[normal]">
              세부 정보
            </p>
          </div>
        </div>

        {/* 반려동물 정보 카드 */}
        <div className="px-[10px] pb-[14px]">
          {isLoading ? (
            <div className="bg-white rounded-[7px] h-[68px] flex items-center justify-center">
              <p className="text-[#858585] text-[14px]">로딩 중...</p>
            </div>
          ) : petDetail ? (
            <div className="bg-white rounded-[7px] h-[68px] flex items-center px-[10px] gap-[6px]">
              {/* 강아지 이미지 */}
              <div className="w-[50px] h-[50px] rounded-full bg-[#e5e5e5] flex items-center justify-center flex-shrink-0 overflow-hidden">
                {petDetail.petImage ? (
                  <img
                    src={petDetail.petImage}
                    alt={petDetail.petName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <circle cx="14" cy="14" r="14" fill="#D9D9D9" />
                    <path
                      d="M14 13C16.2091 13 18 11.2091 18 9C18 6.79086 16.2091 5 14 5C11.7909 5 10 6.79086 10 9C10 11.2091 11.7909 13 14 13Z"
                      fill="white"
                    />
                    <path
                      d="M20 23V21C20 19.9391 19.5786 18.9217 18.8284 18.1716C18.0783 17.4214 17.0609 17 16 17H12C10.9391 17 9.92172 17.4214 9.17157 18.1716C8.42143 18.9217 8 19.9391 8 21V23"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </div>

              {/* 강아지 정보 */}
              <div className="flex flex-col gap-[4px]">
                <div className="flex items-center gap-[4px]">
                  <p className="font-bold text-gray-900 text-[18px] leading-[normal]">
                    {petDetail.petName}
                  </p>
                  {/* 성별 아이콘 */}
                  {petDetail.petGender === "MALE" ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="10" fill="#3F55FF" />
                      <path
                        d="M13 7L13 10M13 7L10 7M13 7L10 10M10 10C9.07003 10.9722 7.5 11.0833 7.5 11.0833C6.5 11.0833 5.91667 12.1944 5.91667 13.25C5.91667 14.3056 6.5 15 7.5 15C8.5 15 9.08333 14.3056 9.08333 13.25"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : petDetail.petGender === "FEMALE" ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="10" fill="#FF3F7F" />
                      <path
                        d="M10 14V16M10 14C11.1046 14 12 13.1046 12 12C12 10.8954 11.1046 10 10 10M10 14C8.89543 14 8 13.1046 8 12C8 10.8954 8.89543 10 10 10M10 10V7M8 16H12"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : null}
                </div>
                <p className="font-medium text-[#6e7783] text-[12px] leading-[normal]">
                  {petDetail.petBreed}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[7px] h-[68px] flex items-center justify-center">
              <p className="text-[#858585] text-[14px]">
                반려동물 정보를 불러올 수 없습니다
              </p>
            </div>
          )}
        </div>

        {/* 구분선 */}
        <div className="w-full h-[10px] bg-[#f2f3f5]" />

        {/* 보호자 정보 */}
        <div className="flex-1 px-[20px] pt-[26px]">
          <p className="font-semibold text-gray-900 text-[18px] leading-[normal] mb-[34px]">
            보호자 정보
          </p>

          {petDetail ? (
            <div className="space-y-[16px]">
              {/* 이름 */}
              <div className="flex items-center mt-[40px] gap-[20px]">
                <p className="font-semibold text-[#6e7783] text-[14px] leading-[normal] w-[67px]">
                  이름
                </p>
                <p className="font-semibold text-[#6e7783] text-[14px] leading-[normal]">
                  {petDetail.ownerName || "-"}
                </p>
              </div>

              {/* 휴대폰 번호 */}
              <div className="flex items-center gap-[20px]">
                <p className="font-semibold text-[#6e7783] text-[14px] leading-[normal] w-[67px]">
                  휴대폰 번호
                </p>
                <p className="font-semibold text-[#6e7783] text-[14px] leading-[normal]">
                  {petDetail.ownerPhone || "-"}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-[40px]">
              <p className="text-[#858585] text-[14px]">
                보호자 정보를 불러올 수 없습니다
              </p>
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        {/* TODO: 전화 구현 */}
        <div className="px-[20px] py-[24px]">
          <button
            onClick={handleCallOwner}
            disabled={!petDetail?.ownerPhone}
            className="w-full bg-[#3f55ff] h-[59px] rounded-[7px] flex items-center justify-center hover:bg-[#3646e6] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <span className="font-semibold text-white text-[16px]">
              보호자에게 전화하기
            </span>
          </button>
        </div>
      </div>
    </MainContainer>
  );
};

export default PetDetailPage;
