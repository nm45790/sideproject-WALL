"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MainContainer from "../../../components/MainContainer";
import Icons from "../../../components/Icons";
import { api } from "../../../utils/api";
import { useAuth } from "../../../components/CombinedProvider";

interface PetDetail {
  id: number;
  petName: string;
  petGender: "MALE" | "FEMALE";
  petBreed: string;
  petImage: string | null;
  ownerName: string;
  ownerPhone: string;
  petBirthday: string;
  ownerId: number;
  academyId: number;
  academyName: string;
  academyAddress: string;
  academyAddressDetail: string;
  academySggCode: string;
  academyPhone: string;
  enrollmentStatus: string;
}

export default function AcceptDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userInfo = useAuth();
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [petDetail, setPetDetail] = useState<PetDetail | null>(null);

  // URL 쿼리에서 ID 가져오기
  const enrollmentId = searchParams.get("enrollmentId");
  const petId = searchParams.get("petId");

  // 강아지 정보 조회
  useEffect(() => {
    const fetchPetDetail = async () => {
      if (!petId || !userInfo?.academyId) {
        console.error("petId 또는 academyId가 없습니다.", { petId, userInfo });
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await api.get(
          `/api/v1/academies/${userInfo.academyId}/pets/${petId}`,
        );

        if (response.success && response.data) {
          const data = (response.data as any).data || response.data;
          console.log("강아지 정보:", data);
          setPetDetail(data);
        } else {
          throw new Error("강아지 정보를 불러올 수 없습니다.");
        }
      } catch (error) {
        console.error("강아지 정보 조회 실패:", error);
        alert("강아지 정보를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPetDetail();
  }, [petId, userInfo?.academyId]);

  // 수락하기
  const handleApprove = async () => {
    if (!enrollmentId || !petDetail) return;

    if (!confirm(`${petDetail.petName}의 등록 신청을 승인하시겠습니까?`)) {
      return;
    }

    try {
      setIsApproving(true);
      const response = await api.post(
        `/api/v1/enrollments/${enrollmentId}/approval`,
      );

      if (response.success) {
        alert("승인이 완료되었습니다.");
        router.push("/academy/accept");
      } else {
        throw new Error("승인에 실패했습니다.");
      }
    } catch (error) {
      console.error("승인 실패:", error);
      alert("승인에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsApproving(false);
    }
  };

  // 승인거절
  const handleReject = async () => {
    if (!enrollmentId || !petDetail) return;

    if (!confirm(`${petDetail.petName}의 등록 신청을 거절하시겠습니까?`)) {
      return;
    }

    try {
      setIsRejecting(true);
      const response = await api.post(
        `/api/v1/enrollments/${enrollmentId}/reject`,
      );

      if (response.success) {
        alert("승인 거절이 완료되었습니다.");
        router.push("/academy/accept");
      } else {
        throw new Error("승인 거절에 실패했습니다.");
      }
    } catch (error) {
      console.error("승인 거절 실패:", error);
      alert("승인 거절에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsRejecting(false);
    }
  };

  // 로딩 중일 때
  if (isLoading) {
    return (
      <MainContainer bg="#ffffff" noPadding>
        <div className="w-full min-h-dvh pb-[150px]">
          <div className="pt-[73px] px-[20px] pb-[27px]">
            <button
              onClick={() => router.back()}
              className="hover:opacity-70 transition-opacity"
            >
              <Icons.Prev className="w-[26px] h-[22px]" />
            </button>
          </div>
          <div className="flex items-center justify-center h-[400px]">
            <p className="font-medium text-[#858585] text-[16px]">로딩 중...</p>
          </div>
        </div>
      </MainContainer>
    );
  }

  // 데이터가 없을 때
  if (!petDetail) {
    return (
      <MainContainer bg="#ffffff" noPadding>
        <div className="w-full min-h-dvh pb-[150px]">
          <div className="pt-[73px] px-[20px] pb-[27px]">
            <button
              onClick={() => router.back()}
              className="hover:opacity-70 transition-opacity"
            >
              <Icons.Prev className="w-[26px] h-[22px]" />
            </button>
          </div>
          <div className="flex items-center justify-center h-[400px]">
            <p className="font-medium text-[#858585] text-[16px]">
              강아지 정보를 찾을 수 없습니다.
            </p>
          </div>
        </div>
      </MainContainer>
    );
  }

  return (
    <MainContainer bg="#ffffff" noPadding>
      <div className="w-full min-h-dvh pb-[150px]">
        {/* 뒤로가기 버튼 */}
        <div className="pt-[73px] px-[20px] pb-[27px]">
          <button
            onClick={() => router.back()}
            className="hover:opacity-70 transition-opacity"
          >
            <Icons.Prev className="w-[26px] h-[22px]" />
          </button>
        </div>

        {/* 세부 정보 섹션 */}
        <div className="px-[20px] mb-[20px]">
          <div className="flex items-center gap-[8px] mb-[20px]">
            <div className="w-[20px] h-[20px] rounded-full bg-[#8e8eff] flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <circle cx="5" cy="5" r="2" fill="white" />
              </svg>
            </div>
            <p className="font-semibold text-gray-900 text-[18px] leading-[normal]">
              세부 정보
            </p>
          </div>

          {/* 강아지 정보 카드 */}
          <div className="bg-white rounded-[10px] p-[16px] flex items-center gap-[12px]">
            {/* 프로필 이미지 */}
            <div className="w-[50px] h-[50px] rounded-full bg-[#e5e5e5] flex items-center justify-center flex-shrink-0 overflow-hidden">
              {petDetail.petImage ? (
                <img
                  src={petDetail.petImage}
                  alt={petDetail.petName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg width="28" height="21" viewBox="0 0 28 21" fill="none">
                  <path
                    d="M14 10.5C16.7614 10.5 19 8.26142 19 5.5C19 2.73858 16.7614 0.5 14 0.5C11.2386 0.5 9 2.73858 9 5.5C9 8.26142 11.2386 10.5 14 10.5Z"
                    fill="white"
                  />
                  <path
                    d="M21 20.5V18.5C21 17.4391 20.5786 16.4217 19.8284 15.6716C19.0783 14.9214 18.0609 14.5 17 14.5H11C9.93913 14.5 8.92172 14.9214 8.17157 15.6716C7.42143 16.4217 7 17.4391 7 18.5V20.5"
                    fill="white"
                  />
                </svg>
              )}
            </div>

            {/* 강아지 정보 */}
            <div className="flex-1">
              <div className="flex items-center gap-[6px] mb-[4px]">
                <p className="font-bold text-gray-900 text-[18px] leading-[normal]">
                  {petDetail.petName}
                </p>
                <span className="text-[16px]">
                  {petDetail.petGender === "MALE" ? "♂" : "♀"}
                </span>
              </div>
              <p className="font-medium text-[#6e7783] text-[12px] leading-[normal]">
                {petDetail.petBreed}
              </p>
            </div>
          </div>
        </div>

        {/* 구분선 */}
        <div className="w-full h-[8px] bg-[#f0f0f0]" />

        {/* 보호자 정보 섹션 */}
        <div className="px-[20px] pt-[31px]">
          <p className="font-semibold text-gray-900 text-[18px] leading-[normal] mb-[31px]">
            보호자 정보
          </p>

          <div className="bg-white rounded-[10px] p-[20px]">
            <div className="flex flex-col gap-y-[16px]">
              <div className="grid grid-cols-2">
                <p className="font-medium text-[#8e8e8e] text-[14px] leading-[normal]">
                  이름
                </p>
                <p className="font-semibold text-gray-900 text-[14px] leading-[normal]">
                  {petDetail.ownerName || "-"}
                </p>
              </div>
              <div className="grid grid-cols-2">
                <p className="font-medium text-[#8e8e8e] text-[14px] leading-[normal]">
                  휴대폰 번호
                </p>
                <p className="font-semibold text-gray-900 text-[14px] leading-[normal]">
                  {petDetail.ownerPhone || "-"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white px-[20px] py-[25px] flex gap-[12px]">
        <button
          onClick={handleApprove}
          disabled={isApproving || isRejecting}
          className={`flex-1 h-[59px] rounded-[7px] flex items-center justify-center transition-colors ${
            isApproving || isRejecting
              ? "bg-[#f0f0f0] cursor-not-allowed"
              : "bg-[#3f55ff] hover:bg-[#3646e6] cursor-pointer"
          }`}
        >
          <span className="font-semibold text-white text-[16px]">
            {isApproving ? "처리 중..." : "수락하기"}
          </span>
        </button>
        <button
          onClick={handleReject}
          disabled={isApproving || isRejecting}
          className={`flex-1 h-[59px] rounded-[7px] flex items-center justify-center transition-colors ${
            isApproving || isRejecting
              ? "bg-[#f0f0f0] cursor-not-allowed"
              : "bg-[#e5e5e5] hover:bg-[#d5d5d5] cursor-pointer"
          }`}
        >
          <span className="font-semibold text-[#6e7783] text-[16px]">
            {isRejecting ? "처리 중..." : "승인거절"}
          </span>
        </button>
      </div>
    </MainContainer>
  );
}
