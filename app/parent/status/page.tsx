"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MainContainer from "../../components/MainContainer";
import Icons from "../../components/Icons";
import DatePickerModal from "../../components/DatePickerModal";
import { useAuth } from "../../components/CombinedProvider";
import { api } from "../../utils/api";
import { formatApiDate, formatDate } from "../../utils/date";
import { getImageUrl } from "../../utils/image";

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

interface ReservationResponse {
  code: number;
  data: {
    reservations: Reservation[];
    totalCount: number;
    checkedInCount: number;
  };
  message?: string;
}

export default function ParentStatusPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userInfo = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [checkedInCount, setCheckedInCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  // URL에서 petId와 academyId 가져오기
  const petId = searchParams.get("petId");
  const academyId = searchParams.get("academyId");

  // 예약 목록 조회
  const fetchReservations = async (date: Date) => {
    if (!academyId) return;

    try {
      setIsLoading(true);
      const searchDay = formatApiDate(date);
      const response = await api.get<ReservationResponse>(
        `/api/v1/reservations/academy/${academyId}?date=${searchDay}`,
      );

      if (response.success && response.data) {
        const data = response.data.data;
        setReservations(data.reservations || []);
        setTotalCount(data.totalCount || 0);
        setCheckedInCount(data.checkedInCount || 0);
      }
    } catch (error) {
      console.error("예약 목록 조회 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 날짜가 변경될 때마다 데이터 조회
  useEffect(() => {
    fetchReservations(selectedDate);
  }, [selectedDate, academyId]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  // 다음 날짜로 이동
  const handleNextDay = () => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setSelectedDate(nextDay);
  };

  // 오늘 날짜인지 확인
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  // 과거 날짜인지 확인
  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    return checkDate < today;
  };

  // 등원 신청하기
  const handleApplyReservation = async () => {
    if (!petId || !academyId) {
      alert("강아지 정보가 없습니다.");
      return;
    }

    if (isPastDate(selectedDate)) {
      alert("과거 날짜는 예약할 수 없습니다.");
      return;
    }

    if (!confirm("등원 신청하시겠습니까?")) {
      return;
    }

    try {
      setIsApplying(true);
      const reservationDate = formatApiDate(selectedDate);

      const response = await api.post("/api/v1/reservations", {
        petId: parseInt(petId),
        academyId: parseInt(academyId),
        reservationDate: reservationDate,
        memo: "",
      });

      if (response.success) {
        alert("등원 신청이 완료되었습니다.");
        // 예약 목록 새로고침
        fetchReservations(selectedDate);
      }
    } catch (error: any) {
      console.error("등원 신청 실패:", error);
      // API 유틸리티에서 자동으로 alert 처리됨
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <MainContainer bg="#ffffff" noPadding>
      <div className="w-full min-h-dvh pb-[100px]">
        {/* 상단 헤더 */}
        <div className="bg-white sticky top-0 z-10">
          <div className="pt-[73px] px-[20px] pb-[20px]">
            <button
              onClick={() => router.back()}
              className="hover:opacity-70 transition-opacity"
            >
              <Icons.Prev className="w-[26px] h-[22px]" />
            </button>
          </div>

          {/* 날짜 선택 및 안내 문구 */}
          <div className="px-[20px] pb-[20px]">
            {/* 날짜 선택 버튼 */}
            <button
              onClick={() => setIsDatePickerOpen(true)}
              className="bg-white rounded-[7px] inline-flex items-center gap-[9px] h-[40px] pl-[12px] pr-[12px] hover:bg-gray-50 transition-colors border border-[#858585] mb-[8px]"
            >
              <div className="w-[9px] h-[10px]">
                <svg
                  width="9"
                  height="10"
                  viewBox="0 0 9 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 9V2C9 1.4485 8.5515 1 8 1H7V0H6V1H3V0H2V1H1C0.4485 1 0 1.4485 0 2V9C0 9.5515 0.4485 10 1 10H8C8.5515 10 9 9.5515 9 9ZM3 8H2V7H3V8ZM3 6H2V5H3V6ZM5 8H4V7H5V8ZM5 6H4V5H5V6ZM7 8H6V7H7V8ZM7 6H6V5H7V6ZM8 3.5H1V2.5H8V3.5Z"
                    fill="#858585"
                  />
                </svg>
              </div>
              <p className="font-semibold text-[#858585] text-[14px] leading-[17px]">
                {formatDate(selectedDate)}
              </p>
            </button>

            {/* 오늘 뱃지 */}
            {isToday(selectedDate) && (
              <div className="bg-[#f9f0fb] rounded-[7px] px-[10px] py-[5px] inline-flex items-center mb-[8px]">
                <p className="font-bold text-[#a052ff] text-[12px] leading-[normal]">
                  오늘
                </p>
              </div>
            )}

            {/* 안내 문구 */}
            {!isLoading && (
              <div>
                <p className="font-bold text-gray-900 leading-[normal]">
                  <span className="text-[30px]">{totalCount} </span>
                  <span className="text-[20px]">
                    마리 친구들이 기다리고 있어요! 🐶
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 구분선 */}
        <div className="w-full h-px bg-[#d2d6db]" />

        {/* 예약 목록 */}
        <div className="px-[20px] pt-[20px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-[200px]">
              <p className="text-[16px] text-[#858585]">로딩 중...</p>
            </div>
          ) : reservations.length === 0 ? (
            <div className="flex items-center justify-center h-[200px]">
              <p className="text-[16px] text-[#858585]">
                등원 예약이 없습니다.
              </p>
            </div>
          ) : (
            <div className="space-y-[3px]">
              {reservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="bg-white rounded-[7px] h-[68px] flex items-center px-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)]"
                >
                  {/* 프로필 이미지 */}
                  <div className="w-[50px] h-[50px] rounded-full bg-[#e5e5e5] flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {reservation.petImage &&
                    getImageUrl(reservation.petImage) ? (
                      <img
                        src={getImageUrl(reservation.petImage) || ""}
                        alt={reservation.petName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg
                        width="28"
                        height="21"
                        viewBox="0 0 28 21"
                        fill="none"
                      >
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
                  <div className="flex-1 ml-[16px]">
                    <p className="font-bold text-gray-900 text-[18px] leading-[normal] mb-[4px]">
                      {reservation.petName}
                    </p>
                    <p className="font-medium text-[#6e7783] text-[12px] leading-[normal]">
                      {reservation.petBreed}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white px-[20px] py-[25px] border-t border-[#f0f0f0]">
        <button
          onClick={handleApplyReservation}
          disabled={
            isApplying || !petId || !academyId || isPastDate(selectedDate)
          }
          className={`w-full h-[59px] rounded-[7px] flex items-center justify-center transition-colors ${
            isApplying || !petId || !academyId || isPastDate(selectedDate)
              ? "bg-[#f0f0f0] cursor-not-allowed"
              : "bg-[#3f55ff] hover:bg-[#3646e6] cursor-pointer"
          }`}
        >
          <span className="font-semibold text-white text-[16px]">
            {isApplying
              ? "신청 중..."
              : isPastDate(selectedDate)
                ? "과거 날짜"
                : "등원신청"}
          </span>
        </button>
      </div>

      {/* 날짜 선택 모달 */}
      <DatePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
      />
    </MainContainer>
  );
}
