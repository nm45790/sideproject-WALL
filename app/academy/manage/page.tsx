"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MainContainer from "../../components/MainContainer";
import Icons from "../../components/Icons";
import { useAuth } from "../../components/CombinedProvider";
import { api } from "../../utils/api";
import { getChosung, isChosungSearch } from "../../utils/search";
import { getImageUrl } from "../../utils/image";

interface Enrollment {
  enrollmentId: number;
  academyId: number;
  petId: number;
  petName: string;
  petGender: string;
  petBreed: string;
  status: string;
  startDate: string;
  endDate: string;
  petImage: string | null;
}

const AcademyManagePage = () => {
  const router = useRouter();
  const userInfo = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState<Enrollment[]>(
    [],
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 등록된 반려동물 목록 조회
  const fetchEnrollments = async () => {
    if (!userInfo?.academyId) return;

    try {
      setIsLoading(true);
      const response = await api.get(
        `/api/v1/enrollments/${userInfo.academyId}`,
      );

      console.log("🐕 등록된 반려동물 API 응답:", response);

      if (response.success && response.data && (response.data as any).data) {
        const enrollmentsData = (response.data as any).data as Enrollment[];
        console.log("🐕 파싱된 등록 정보:", enrollmentsData);
        setEnrollments(enrollmentsData);
        setFilteredEnrollments(enrollmentsData);
      } else {
        setEnrollments([]);
        setFilteredEnrollments([]);
      }
    } catch (error) {
      console.error("등록 정보 조회 실패:", error);
      setEnrollments([]);
      setFilteredEnrollments([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 검색 필터링 (초성 검색 포함)
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredEnrollments(enrollments);
    } else {
      const query = searchQuery.trim();

      // 초성 검색인 경우
      if (isChosungSearch(query)) {
        const filtered = enrollments.filter((enrollment) => {
          const nameChosung = getChosung(enrollment.petName);
          return nameChosung.startsWith(query);
        });
        setFilteredEnrollments(filtered);
      } else {
        // 일반 검색 (이름에 포함된 경우)
        const filtered = enrollments.filter((enrollment) =>
          enrollment.petName.toLowerCase().includes(query.toLowerCase()),
        );
        setFilteredEnrollments(filtered);
      }
    }
  }, [searchQuery, enrollments]);

  // 초기 데이터 조회
  useEffect(() => {
    if (userInfo?.academyId) {
      fetchEnrollments();
    }
  }, [userInfo?.academyId]);

  return (
    <MainContainer bg="#ffffff" noPadding>
      <div className="w-full min-h-dvh">
        {/* 상단 헤더 */}
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

          {/* 아이콘 + 제목 + 원생 수 */}
          <div className="px-[20px] pb-[8px]">
            <div className="flex items-center justify-between">
              {/* 왼쪽: 아이콘 + 제목 */}
              <div className="flex items-center gap-[12px]">
                <div className="w-[52px] h-[52px] bg-gradient-to-br from-[#4dd5c5] to-[#2bb8a7] rounded-[10px] flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <path
                      d="M14 2L16 8L22 10L16 12L14 18L12 12L6 10L12 8L14 2Z"
                      fill="white"
                    />
                    <path
                      d="M8 18L9 21L12 22L9 23L8 26L7 23L4 22L7 21L8 18Z"
                      fill="white"
                    />
                    <path
                      d="M20 18L21 21L24 22L21 23L20 26L19 23L16 22L19 21L20 18Z"
                      fill="white"
                    />
                  </svg>
                </div>
                <p className="font-bold text-gray-900 text-[20px] leading-[normal]">
                  아이들 관리
                </p>
              </div>

              {/* 오른쪽: 원생 수 */}
              <div className="flex items-end gap-[4px]">
                <p className="font-bold text-gray-900 text-[30px] leading-[30px]">
                  {enrollments.length}
                </p>
                <p className="font-bold text-gray-900 text-[20px] leading-[20px] pb-[2px]">
                  마리
                </p>
              </div>
            </div>
          </div>

          {/* 설명 */}
          <div className="px-[20px] pb-[14px]">
            <p className="font-medium text-[#6e7783] text-[12px] leading-[normal]">
              모든 원생을 한눈에 확인하고 관리하세요.
            </p>
          </div>

          {/* 검색 인풋 - Sticky */}
          <div className="sticky top-0 z-10 bg-white px-[20px] pb-[20px]">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="이름을 입력해주세요"
                className="w-full h-[59px] border border-[#d2d2d2] rounded-[7px] px-[20px] text-[16px] font-medium text-gray-900 placeholder:text-[#b4b4b4] focus:outline-none focus:border-[#3f55ff]"
              />
              <svg
                className="absolute right-[20px] top-[50%] translate-y-[-50%] pointer-events-none"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
              >
                <circle cx="9" cy="9" r="6" stroke="#b4b4b4" strokeWidth="2" />
                <path
                  d="M14 14L17 17"
                  stroke="#b4b4b4"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* 구분선 */}
          <div className="w-full h-[1px] bg-[#d2d6db]" />
        </div>

        {/* 강아지 리스트 */}
        <div className="px-[20px] mt-[20px] space-y-[3px] pb-[24px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-[60px]">
              <p className="text-[#858585] text-[14px]">로딩 중...</p>
            </div>
          ) : filteredEnrollments.length === 0 ? (
            <div className="bg-white py-[60px] flex flex-col items-center justify-center">
              <p className="font-medium text-[#858585] text-[14px] leading-[17px]">
                {searchQuery
                  ? "검색 결과가 없습니다"
                  : "등록된 원생이 없습니다"}
              </p>
            </div>
          ) : (
            filteredEnrollments.map((enrollment) => (
              <div
                key={enrollment.enrollmentId}
                onClick={() =>
                  router.push(`/academy/petdetail?petId=${enrollment.petId}`)
                }
                className="bg-white rounded-[7px] h-[68px] flex items-center px-[10px] gap-[6px] cursor-pointer hover:bg-gray-50 transition-colors"
              >
                {/* 강아지 이미지 */}
                <div className="w-[50px] h-[50px] rounded-full bg-[#e5e5e5] flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {enrollment.petImage && getImageUrl(enrollment.petImage) ? (
                    <img
                      src={getImageUrl(enrollment.petImage)!}
                      alt={enrollment.petName}
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
                      {enrollment.petName}
                    </p>
                    {/* 성별 아이콘 */}
                    {enrollment.petGender === "MALE" ? (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <circle cx="10" cy="10" r="10" fill="#3F55FF" />
                        <path
                          d="M13 7L13 10M13 7L10 7M13 7L10 10M10 10C9.07003 10.9722 7.5 11.0833 7.5 11.0833C6.5 11.0833 5.91667 12.1944 5.91667 13.25C5.91667 14.3056 6.5 15 7.5 15C8.5 15 9.08333 14.3056 9.08333 13.25"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : enrollment.petGender === "FEMALE" ? (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
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
                    {enrollment.petBreed}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </MainContainer>
  );
};

export default AcademyManagePage;
