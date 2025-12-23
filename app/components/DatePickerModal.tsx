"use client";

import { useState, useEffect } from "react";
import Icons from "./Icons";

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export default function DatePickerModal({
  isOpen,
  onClose,
  selectedDate,
  onDateSelect,
}: DatePickerModalProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
  const [isYearMode, setIsYearMode] = useState(false);

  useEffect(() => {
    setCurrentMonth(new Date(selectedDate));
  }, [selectedDate]);

  if (!isOpen) return null;

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // 년도 선택 모드용 년도 리스트 생성 (올해부터 과거 30년까지)
  const currentYear = new Date().getFullYear();
  const yearList = Array.from({ length: 31 }, (_, i) => currentYear - i);

  // 해당 월의 첫날과 마지막날
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // 달력 시작일 (일요일부터 시작)
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());

  // 달력에 표시할 날짜들 생성
  const calendarDays: Date[] = [];
  const currentDate = new Date(startDate);

  for (let i = 0; i < 42; i++) {
    calendarDays.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleYearSelect = (selectedYear: number) => {
    setCurrentMonth(new Date(selectedYear, month, 1));
    setIsYearMode(false);
  };

  const handleDateClick = (date: Date) => {
    onDateSelect(date);
    onClose();
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === month;
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-white"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-white w-full h-full relative flex flex-col">
        {/* 뒤로가기 버튼 */}
        <div className="flex items-center pt-[45px] pb-[20px]">
          <button
            onClick={onClose}
            className="p-[18px] w-[57px] h-[57px] flex items-center justify-center ml-0.5"
          >
            <Icons.Prev className="w-[26px] h-[22px]" />
          </button>
        </div>

        {/* 년/월 표시 및 이동 버튼 */}
        <div className="flex items-center justify-center gap-[16px] mt-[40px] mb-[60px]">
          {!isYearMode ? (
            <>
              <button
                onClick={handlePrevMonth}
                className="bg-[#f6f6f6] rounded-[7px] w-[44px] h-[44px] flex items-center justify-center"
              >
                <svg width="26" height="22" viewBox="0 0 26 22" fill="none">
                  <path
                    d="M15 7L10 11L15 15"
                    stroke="#363e4a"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <button
                onClick={() => setIsYearMode(true)}
                className="font-bold text-gray-900 text-[25px] leading-normal min-w-[180px] text-center hover:text-[#3f55ff] transition-colors"
              >
                {year}년 {String(month + 1).padStart(2, "0")}월
              </button>

              <button
                onClick={handleNextMonth}
                className="bg-[#f6f6f6] rounded-[7px] w-[44px] h-[44px] flex items-center justify-center"
              >
                <svg width="26" height="22" viewBox="0 0 26 22" fill="none">
                  <path
                    d="M11 7L16 11L11 15"
                    stroke="#363e4a"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsYearMode(false)}
              className="font-bold text-gray-900 text-[25px] leading-normal min-w-[180px] text-center hover:text-[#3f55ff] transition-colors"
            >
              년도 선택
            </button>
          )}
        </div>

        {!isYearMode ? (
          <>
            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 px-[35px] mb-[13px]">
              {["일", "월", "화", "수", "목", "금", "토"].map((day, index) => (
                <div
                  key={day}
                  className="flex items-center justify-center h-[44px]"
                >
                  <p
                    className={`font-medium text-[14px] leading-normal ${
                      index === 0 ? "text-[#f56868]" : "text-[#6e7783]"
                    }`}
                  >
                    {day}
                  </p>
                </div>
              ))}
            </div>

            {/* 날짜 그리드 */}
            <div className="flex-1 overflow-y-auto px-[35px]">
              <div className="grid grid-cols-7 gap-y-[8px]">
                {calendarDays.map((date, index) => {
                  const isSelected = isSameDay(date, selectedDate);
                  const isInCurrentMonth = isCurrentMonth(date);

                  return (
                    <button
                      key={index}
                      onClick={() => handleDateClick(date)}
                      className={`
                        h-[50px] w-[50px] rounded-[7px] flex items-center justify-center mx-auto
                        ${isSelected ? "bg-[#3f59ff]" : "bg-white"}
                        ${!isInCurrentMonth ? "opacity-30" : ""}
                      `}
                    >
                      <p
                        className={`font-bold text-[18px] leading-normal ${
                          isSelected ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {date.getDate()}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          /* 년도 선택 그리드 */
          <div className="flex-1 overflow-y-auto px-[35px]">
            <div className="grid grid-cols-3 gap-[12px] pb-[20px]">
              {yearList.map((y) => (
                <button
                  key={y}
                  onClick={() => handleYearSelect(y)}
                  className={`
                    h-[60px] rounded-[7px] flex items-center justify-center
                    ${y === year ? "bg-[#3f55ff]" : "bg-[#f6f6f6]"}
                    hover:bg-[#3f55ff] hover:bg-opacity-80 transition-colors
                  `}
                >
                  <p
                    className={`font-bold text-[18px] leading-normal ${
                      y === year ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {y}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
