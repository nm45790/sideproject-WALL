"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import MainContainer from "../components/MainContainer";
import DatePickerModal from "../components/DatePickerModal";
import { useAuth } from "../components/CombinedProvider";
import { api } from "../utils/api";
import { formatApiDate, formatDate } from "../utils/date";
import { useRouter } from "next/navigation";
import { useStateStore } from "../store/stateStore";

export default function Academy() {
  const userInfo = useAuth();
  const router = useRouter();
  const { getSelectedDate, updateSelectedDate } = useStateStore();
  const [selectedDate, setSelectedDate] = useState(getSelectedDate());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [totalDogs, setTotalDogs] = useState(0);

  // 일정 데이터 조회
  const fetchScheduleData = async (date: Date) => {
    if (!userInfo?.academyId) return;

    try {
      const searchDay = formatApiDate(date);
      const response = await api.get(
        `/api/v1/academies/${userInfo.academyId}/schedules/date/${searchDay}`,
      );

      if (response.success && response.data) {
        const apiResponse = response.data as any;
        // API 응답 구조: { code, data: { currentReservations, ... } }
        const data = apiResponse.data;
        // currentReservations 값을 totalDogs로 설정
        setTotalDogs(data?.currentReservations || 0);
      }
    } catch (error) {
      console.error("일정 조회 실패:", error);
    } finally {
    }
  };

  // 날짜가 변경될 때마다 데이터 조회
  useEffect(() => {
    fetchScheduleData(selectedDate);
  }, [selectedDate, userInfo?.academyId]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    updateSelectedDate(date);
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

  // status 페이지 URL 생성 (날짜 쿼리스트링 포함)
  const statusUrl = useMemo(() => {
    const yy = selectedDate.getFullYear().toString().substring(2);
    const mm = (selectedDate.getMonth() + 1).toString().padStart(2, "0");
    const dd = selectedDate.getDate().toString().padStart(2, "0");
    const dateStr = `${yy}${mm}${dd}`;
    return `/academy/status?date=${dateStr}`;
  }, [selectedDate]);

  return (
    <>
      {/* 메인 콘텐츠 */}
      <div className={`w-full flex justify-center`}>
        <MainContainer bg="#f3f4f9">
          <div className="relative w-full min-h-dvh">
            {/* 인사말 및 아카데미 이름 */}
            <div className="pt-[73px]">
              <p className="font-bold text-gray-900 text-[20px] leading-[24px]">
                안녕하세요!
              </p>
              <div className="flex items-center gap-[4px] mt-[5px]">
                <div className="bg-[#3f59ff] rounded-[7px] px-[8px] py-[5px]">
                  <p className="font-bold text-white text-[20px] leading-[24px]">
                    {userInfo?.name || "보호자"}
                  </p>
                </div>
                <p className="font-bold text-gray-900 text-[20px] leading-[24px]">
                  선생님! 👋
                </p>
              </div>
            </div>

            {/* 날짜 표시 */}
            <button
              onClick={() => setIsDatePickerOpen(true)}
              className="mt-[30px] bg-white rounded-[7px] inline-flex items-center gap-[9px] h-[40px] pl-[12px] pr-[12px] hover:bg-gray-50 transition-colors"
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

            {/* 등원 현황 카드 */}
            <div className="mt-[8px] bg-white rounded-[7px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] py-[15px] px-[20px]">
              {/* 상단 안내문구 */}
              <div className="flex items-center gap-[8px] mb-[32px]">
                <div className="w-[4px] h-[4px] rounded-full bg-[#858585]" />
                <p className="font-medium text-[#858585] text-[12px] leading-[14px]">
                  보호자가 등원 신청하면 바로 확인 가능해요
                </p>
              </div>

              {/* 중앙 컨텐츠 영역 */}
              <div className="flex items-center justify-between">
                {/* 중앙 숫자 및 텍스트 (클릭 가능) */}
                <Link
                  href={statusUrl}
                  className="flex-1 flex flex-col items-center hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <p className="font-bold text-gray-900 text-[55px] leading-[54px] text-center mb-[7px]">
                    {totalDogs}
                  </p>
                  <p className="font-bold text-gray-900 text-[20px] leading-[normal] mb-[8px]">
                    마리
                  </p>
                  <div
                    className={`rounded-[7px] px-[10px] py-[5px] flex items-center justify-center ${
                      isToday(selectedDate) ? "bg-[#f9f0fb]" : "bg-transparent"
                    }`}
                    style={{ minHeight: 28 }}
                  >
                    {isToday(selectedDate) && (
                      <p className="font-bold text-[#a052ff] text-[12px] leading-[normal]">
                        오늘
                      </p>
                    )}
                  </div>
                </Link>

                {/* 우측 화살표 아이콘 (클릭 유도용 UI, 비활성) */}
                <div className="flex-shrink-0 opacity-40">
                  <svg width="6" height="13" viewBox="0 0 6 13" fill="none">
                    <path
                      d="M1 1L5 6.5L1 12"
                      stroke="#858585"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* 메뉴 카드 그리드 */}
            {/* TODO: 아이콘 -> 이미지로 수정하기 */}
            <div className="mt-[11px] grid grid-cols-2 gap-x-[11px] gap-y-[11px]">
              {/* 아이들 관리 */}
              <button
                onClick={() => router.push("/academy/manage")}
                className="bg-white rounded-[7px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] w-full h-[162px] flex flex-col items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <div className="w-[52px] h-[52px] mb-[6px]">
                  <div className="w-full h-full bg-gradient-to-br from-[#4fd1c5] to-[#38b2ac] rounded-full flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="8.5"
                        cy="7"
                        r="4"
                        stroke="white"
                        strokeWidth="2"
                      />
                      <path
                        d="M20 8V14M17 11H23"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
                <p className="font-semibold text-gray-900 text-[14px] leading-[normal]">
                  아이들 관리
                </p>
              </button>

              {/* 유치원 설정 */}
              <button
                onClick={() => router.push("/academy/setting")}
                className="bg-white rounded-[7px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] w-full h-[162px] flex flex-col items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <div className="w-[52px] h-[52px] mb-[6px]">
                  <div className="w-full h-full bg-gradient-to-br from-[#f687b3] to-[#ed64a6] rounded-full flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M3 21H21M4 21V9L12 3L20 9V21M9 21V15H15V21"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
                <p className="font-semibold text-gray-900 text-[14px] leading-[normal]">
                  유치원 설정
                </p>
              </button>

              {/* 승인 관리 */}
              <button
                onClick={() => router.push("/academy/accept")}
                className="bg-white rounded-[7px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] w-full h-[162px] flex flex-col items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <div className="w-[52px] h-[52px] mb-[6px]">
                  <div className="w-full h-full bg-gradient-to-br from-[#fc8181] to-[#f56565] rounded-full flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
                <p className="font-semibold text-gray-900 text-[14px] leading-[normal]">
                  승인 관리
                </p>
              </button>
            </div>
          </div>
        </MainContainer>
      </div>

      {/* 날짜 선택 모달 */}
      <DatePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
      />
    </>
  );
}
