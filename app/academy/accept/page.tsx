"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MainContainer from "../../components/MainContainer";
import Icons from "../../components/Icons";
import { useAuth } from "../../components/CombinedProvider";
import { api } from "../../utils/api";

interface Enrollment {
  enrollmentId: number;
  academyId: number;
  petId: number;
  petName: string;
  petGender: "MALE" | "FEMALE";
  petBreed: string;
  status: string;
  startDate: string;
  endDate: string;
  petImage: string | null;
}

interface ApiResponse {
  code: number;
  data: Enrollment[];
}

export default function AcceptPage() {
  const router = useRouter();
  const userInfo = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 대기 중인 등록 신청 조회
  const fetchEnrollments = async () => {
    if (!userInfo?.academyId) return;

    try {
      setIsLoading(true);
      const response = await api.get(
        `/api/v1/enrollments/${userInfo.academyId}/waiting`,
      );

      if (response.success && response.data) {
        const apiData = (response.data as any).data || [];
        setEnrollments(apiData as Enrollment[]);
      } else {
        setEnrollments([]);
      }
    } catch (error) {
      console.error("등록 신청 조회 실패:", error);
      setEnrollments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo?.academyId) {
      fetchEnrollments();
    }
  }, [userInfo?.academyId]);

  return (
    <MainContainer bg="#ffffff" noPadding>
      <div className="w-full min-h-dvh">
        {/* 뒤로가기 버튼 */}
        <div className="pt-[73px] px-[20px]">
          <button
            onClick={() => router.back()}
            className="hover:opacity-70 transition-opacity"
          >
            <Icons.Prev className="w-[26px] h-[22px]" />
          </button>
        </div>

        {/* 헤더 - 아이콘 + 제목 */}
        <div className="bg-white px-[20px] pt-[27px] pb-[14px]">
          <div className="flex items-center gap-[12px] mb-[8px]">
            <div className="w-[52px] h-[52px] bg-gradient-to-br from-[#ff9966] to-[#ff6633] rounded-[10px] flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path
                  d="M14 7V14L18 16M26 14C26 20.6274 20.6274 26 14 26C7.37258 26 2 20.6274 2 14C2 7.37258 7.37258 2 14 2C20.6274 2 26 7.37258 26 14Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <p className="font-bold text-gray-900 text-[20px] leading-[normal]">
            승인 관리
          </p>
        </div>

        {/* 구분선 */}
        <div className="w-full h-[1px] bg-[#d2d6db]" />

        {/* 강아지 리스트 */}
        <div className="px-[20px] mt-[20px] space-y-[3px] pb-[24px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-[60px]">
              <p className="text-[#858585] text-[14px]">로딩 중...</p>
            </div>
          ) : enrollments.length === 0 ? (
            <div className="bg-white py-[60px] flex flex-col items-center justify-center">
              <p className="font-medium text-[#858585] text-[14px] leading-[17px]">
                승인 대기 중인 신청이 없습니다
              </p>
            </div>
          ) : (
            enrollments.map((enrollment) => (
              <button
                key={enrollment.enrollmentId}
                onClick={() => {
                  // 세부정보 페이지로 이동 (enrollmentId와 petId만 전달)
                  const params = new URLSearchParams({
                    enrollmentId: enrollment.enrollmentId.toString(),
                    petId: enrollment.petId.toString(),
                  });
                  router.push(`/academy/accept/detail?${params.toString()}`);
                }}
                className="bg-white rounded-[7px] h-[68px] flex items-center px-[10px] gap-[6px] hover:bg-gray-50 transition-colors w-full text-left"
              >
                {/* 강아지 이미지 */}
                <div className="w-[50px] h-[50px] rounded-full bg-[#e5e5e5] flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {enrollment.petImage ? (
                    <img
                      src={enrollment.petImage}
                      alt={enrollment.petName}
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
                  <div className="flex items-center gap-[4px] mb-[4px]">
                    <p className="font-bold text-gray-900 text-[18px] leading-[normal]">
                      {enrollment.petName}
                    </p>
                    {/* 성별 아이콘 */}
                    <span className="text-[16px]">
                      {enrollment.petGender === "MALE" ? "♂" : "♀"}
                    </span>
                  </div>
                  <p className="font-medium text-[#6e7783] text-[12px] leading-[normal]">
                    {enrollment.petBreed}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </MainContainer>
  );
}
