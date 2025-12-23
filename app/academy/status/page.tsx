"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MainContainer from "../../components/MainContainer";
import Icons from "../../components/Icons";
import { useAuth } from "../../components/CombinedProvider";
import { api } from "../../utils/api";
import { formatApiDate, formatDateWithDay } from "../../utils/date";

interface Reservation {
  id: number;
  petId: number;
  academyId: number;
  petName: string;
  petBreed: string;
  academyName: string;
  reservationDate: string;
  reservationStatus: string;
  petImage: string | null;
}

interface ApiResponse {
  reservations: Reservation[];
  totalCount: number;
  checkedInCount: number;
}

const AcademyStatusPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userInfo = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 쿼리스트링에서 날짜 파싱 (YYMMDD 형식)
  useEffect(() => {
    const dateParam = searchParams.get("date");
    if (dateParam) {
      // YYMMDD 형식을 Date 객체로 변환
      const year = 2000 + parseInt(dateParam.substring(0, 2));
      const month = parseInt(dateParam.substring(2, 4)) - 1; // 월은 0부터 시작
      const day = parseInt(dateParam.substring(4, 6));
      const date = new Date(year, month, day);
      setSelectedDate(date);
    } else {
      // 쿼리스트링이 없으면 오늘 날짜로 설정
      setSelectedDate(new Date());
    }
  }, [searchParams]);

  // 예약 데이터 조회
  const fetchReservations = async (date: Date) => {
    if (!userInfo?.academyId) return;

    try {
      setIsLoading(true);
      const searchDay = formatApiDate(date);
      const response = await api.get(
        `/api/v1/reservations/academy/${userInfo.academyId}?date=${searchDay}`,
      );

      if (response.success && response.data && (response.data as any).data) {
        const apiData = (response.data as any).data as ApiResponse;
        const reservationsData = apiData.reservations || [];
        setReservations(reservationsData);
      } else {
        setReservations([]);
      }
    } catch (error) {
      console.error("예약 조회 실패:", error);
      setReservations([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 날짜가 변경될 때마다 데이터 조회
  useEffect(() => {
    if (selectedDate) {
      fetchReservations(selectedDate);
    }
  }, [selectedDate, userInfo?.academyId]);

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

        {/* 상단 영역: 마릿수 + 날짜 */}
        <div className="px-[20px] mt-[27px] flex items-start justify-between">
          {/* 왼쪽: 마릿수 */}
          <div className="flex items-end gap-[6px]">
            <p className="font-bold text-gray-900 text-[55px] leading-[54px]">
              {reservations.length}
            </p>
            <p className="font-bold text-gray-900 text-[20px] leading-[normal] pb-[4px]">
              마리
            </p>
          </div>

          {/* 오른쪽: 날짜 */}
          <div className="pt-[28px]">
            <p className="font-semibold text-[#161111] text-[14px] leading-[normal]">
              {selectedDate ? formatDateWithDay(selectedDate) : ""}
            </p>
          </div>
        </div>

        {/* 구분선 */}
        <div className="w-full h-[1px] bg-[#d2d6db] mt-[18px]" />

        {/* 강아지 리스트 */}
        <div className="px-[20px] mt-[20px] space-y-[3px] pb-[24px]">
          {!selectedDate || isLoading ? (
            <div className="flex items-center justify-center py-[60px]">
              <p className="text-[#858585] text-[14px]">로딩 중...</p>
            </div>
          ) : reservations.length === 0 ? (
            <div className="bg-white py-[60px] flex flex-col items-center justify-center">
              <p className="font-medium text-[#858585] text-[14px] leading-[17px]">
                등원한 강아지가 없습니다
              </p>
            </div>
          ) : (
            reservations.map((reservation) => (
              <div
                key={reservation.id}
                onClick={() =>
                  router.push(`/academy/petdetail?petId=${reservation.petId}`)
                }
                className="bg-white rounded-[7px] h-[68px] flex items-center px-[10px] gap-[6px] cursor-pointer hover:bg-gray-50 transition-colors"
              >
                {/* 강아지 이미지 */}
                <div className="w-[50px] h-[50px] rounded-full bg-[#e5e5e5] flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {reservation.petImage ? (
                    <img
                      src={reservation.petImage}
                      alt={reservation.petName}
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
                  <p className="font-bold text-gray-900 text-[18px] leading-[normal] mb-[4px]">
                    {reservation.petName}
                  </p>
                  <p className="font-medium text-[#6e7783] text-[12px] leading-[normal]">
                    {reservation.petBreed}
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

export default AcademyStatusPage;
