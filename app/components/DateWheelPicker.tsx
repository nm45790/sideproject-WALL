"use client";

import { useState, useRef, useEffect } from "react";

interface DateWheelPickerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  title?: string;
}

export default function DateWheelPicker({
  isOpen,
  onClose,
  selectedDate,
  onDateSelect,
  title = "반려견 생일 변경",
}: DateWheelPickerProps) {
  // 년도 범위 (현재년도 기준 -30년부터 현재까지)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 31 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const [year, setYear] = useState(selectedDate.getFullYear());
  const [month, setMonth] = useState(selectedDate.getMonth() + 1);
  const [day, setDay] = useState(selectedDate.getDate());

  // 일은 1~31일 고정
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  // 가운데(활성화) 인덱스 추적 - 초기값을 selectedDate 기반으로 설정
  const [centerYearIndex, setCenterYearIndex] = useState(() =>
    years.indexOf(selectedDate.getFullYear()),
  );
  const [centerMonthIndex, setCenterMonthIndex] = useState(
    () => selectedDate.getMonth(), // 0-based (0~11)
  );
  const [centerDayIndex, setCenterDayIndex] = useState(
    () => selectedDate.getDate() - 1, // 0-based (0~30)
  );

  const yearRef = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);
  const dayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const newYear = selectedDate.getFullYear();
      const newMonth = selectedDate.getMonth() + 1;
      const newDay = selectedDate.getDate();

      setYear(newYear);
      setMonth(newMonth);
      setDay(newDay);

      // 모달이 열릴 때 스크롤 위치 초기화 (선택된 날짜가 중앙에 오도록)
      setTimeout(() => {
        const yearIndex = years.indexOf(newYear);
        const monthIndex = newMonth - 1; // 0-based
        const dayIndex = newDay - 1; // 0-based

        // 초기 center 인덱스 설정
        setCenterYearIndex(yearIndex);
        setCenterMonthIndex(monthIndex);
        setCenterDayIndex(dayIndex);

        if (yearRef.current)
          yearRef.current.scrollTop = yearIndex * ITEM_HEIGHT;
        if (monthRef.current)
          monthRef.current.scrollTop = monthIndex * ITEM_HEIGHT;
        if (dayRef.current) dayRef.current.scrollTop = dayIndex * ITEM_HEIGHT;
      }, 150);
    }
  }, [isOpen, selectedDate]);

  // 월이나 년도가 변경되면 일자 조정
  useEffect(() => {
    const maxDay = getDaysInMonth(year, month);
    if (day > maxDay) {
      setDay(maxDay);
      setCenterDayIndex(maxDay - 1);
      if (dayRef.current) {
        dayRef.current.scrollTop = (maxDay - 1) * ITEM_HEIGHT;
      }
    }
  }, [year, month, day]);

  const ITEM_HEIGHT = 60;

  // 스크롤 중 실시간 업데이트
  const handleScroll = (
    ref: React.RefObject<HTMLDivElement | null>,
    values: number[],
    setter: (value: number) => void,
    isCircular: boolean = false,
    setCenterIndex?: (index: number) => void,
  ) => {
    if (!ref.current) return;

    const scrollTop = ref.current.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);

    if (isCircular) {
      // 순환 배열의 경우 중간 섹션의 인덱스로 변환
      const realIndex = index % values.length;
      setter(values[realIndex]);
      if (setCenterIndex) setCenterIndex(index);
    } else {
      const clampedIndex = Math.max(0, Math.min(index, values.length - 1));
      setter(values[clampedIndex]);
      if (setCenterIndex) setCenterIndex(clampedIndex);
    }
  };

  const handleScrollEnd = (
    ref: React.RefObject<HTMLDivElement | null>,
    values: number[],
    setter: (value: number) => void,
    isCircular: boolean = false,
    setCenterIndex?: (index: number) => void,
  ) => {
    if (!ref.current) return;

    const scrollTop = ref.current.scrollTop;
    let index = Math.round(scrollTop / ITEM_HEIGHT);

    if (isCircular) {
      // 순환 배열의 경우
      const totalLength = values.length * 3;
      index = Math.max(0, Math.min(index, totalLength - 1));
      const realIndex = index % values.length;
      setter(values[realIndex]);
      if (setCenterIndex) setCenterIndex(index);

      // 중간 섹션으로 점프 (무한 스크롤 효과)
      const middleIndex = values.length + realIndex;
      setTimeout(() => {
        if (ref.current) {
          ref.current.scrollTo({
            top: middleIndex * ITEM_HEIGHT,
            behavior: "auto",
          });
          if (setCenterIndex) setCenterIndex(middleIndex);
        }
      }, 100);
    } else {
      const clampedIndex = Math.max(0, Math.min(index, values.length - 1));
      setter(values[clampedIndex]);
      if (setCenterIndex) setCenterIndex(clampedIndex);

      // 스냅 효과
      ref.current.scrollTo({
        top: clampedIndex * ITEM_HEIGHT,
        behavior: "smooth",
      });
    }
  };

  const handleConfirm = () => {
    const newDate = new Date(year, month - 1, day);
    onDateSelect(newDate);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      {/* 반투명 어두운 배경 */}
      <div className="absolute inset-0 bg-black/40" />

      {/* 모달 컨텐츠 */}
      <div
        className="relative w-full bg-white rounded-t-[15px] flex flex-col"
        style={{ height: "50vh", minHeight: "400px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단 타이틀 */}
        <div className="px-[20px] pt-[39px] pb-[30px]">
          <h2 className="text-[20px] font-bold text-[#363e4a]">{title}</h2>
        </div>

        {/* 휠 피커 영역 */}
        <div className="flex-1 relative overflow-hidden flex items-center">
          {/* 상단 그라데이션 오버레이 */}
          <div className="absolute top-0 left-0 right-0 h-[80px] bg-gradient-to-b from-white via-white/50 to-transparent pointer-events-none z-10" />

          {/* 하단 그라데이션 오버레이 */}
          <div className="absolute bottom-0 left-0 right-0 h-[80px] bg-gradient-to-t from-white via-white/50 to-transparent pointer-events-none z-10" />

          {/* 중앙 선택 영역 표시 (상단 구분선) */}
          <div
            className="absolute right-[20px] h-[1px] bg-[#d2d2d2] pointer-events-none z-10"
            style={{
              left: "calc(20px + 26px + 20px)",
              top: "calc(50% - 30px)",
            }}
          />

          {/* 중앙 선택 영역 표시 (하단 구분선) */}
          <div
            className="absolute right-[20px] h-[1px] bg-[#d2d2d2] pointer-events-none z-10"
            style={{
              left: "calc(20px + 26px + 20px)",
              top: "calc(50% + 30px)",
            }}
          />

          {/* 휠 컨테이너 */}
          <div className="flex items-center justify-center w-full px-[20px] gap-[20px]">
            {/* 생일 아이콘 */}
            <div
              className="flex-shrink-0"
              style={{ height: "180px", display: "flex", alignItems: "center" }}
            >
              <svg
                width="26"
                height="28"
                viewBox="0 0 26 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13.8667 0.28C13.6166 0.0982491 13.3125 0 13 0C12.6875 0 12.3834 0.0982491 12.1333 0.28C11.5316 0.726849 10.9766 1.23001 10.4766 1.7822C9.72111 2.6068 8.66667 3.997 8.66667 5.6C8.66667 6.71391 9.12321 7.7822 9.93587 8.56985C10.7485 9.3575 11.8507 9.8 13 9.8H4.33333C3.18406 9.8 2.08186 10.2425 1.2692 11.0302C0.456546 11.8178 0 12.8861 0 14V16.8C0 18.5304 2.03811 19.5188 3.46667 18.48L4.43011 17.78C4.68014 17.5982 4.98424 17.5 5.29678 17.5C5.60931 17.5 5.91342 17.5982 6.16344 17.78L6.54767 18.06C7.29775 18.6053 8.21006 18.9 9.14767 18.9C10.0853 18.9 10.9976 18.6053 11.7477 18.06L12.1333 17.78C12.3834 17.5982 12.6875 17.5 13 17.5C13.3125 17.5 13.6166 17.5982 13.8667 17.78L14.2523 18.06C15.0024 18.6053 15.9147 18.9 16.8523 18.9C17.7899 18.9 18.7022 18.6053 19.4523 18.06L19.8366 17.78C20.0866 17.5982 20.3907 17.5 20.7032 17.5C21.0158 17.5 21.3199 17.5982 21.5699 17.78L22.5333 18.48C23.9619 19.5188 26 18.5304 26 16.8V14C26 12.8861 25.5435 11.8178 24.7308 11.0302C23.9181 10.2425 22.8159 9.8 21.6667 9.8H13C14.1493 9.8 15.2515 9.3575 16.0641 8.56985C16.8768 7.7822 17.3333 6.71391 17.3333 5.6C17.3333 3.997 16.2789 2.6068 15.5234 1.7822C15.0237 1.2362 14.469 0.7182 13.8667 0.28ZM1.44444 21.581V25.2C1.44444 25.9426 1.74881 26.6548 2.29058 27.1799C2.83235 27.705 3.56715 28 4.33333 28H21.6667C22.4328 28 23.1676 27.705 23.7094 27.1799C24.2512 26.6548 24.5556 25.9426 24.5556 25.2V21.581C24.2194 21.6987 23.8582 21.7328 23.5049 21.6802C23.1516 21.6276 22.8176 21.49 22.5333 21.28L21.5699 20.58C21.3199 20.3983 21.0158 20.3 20.7032 20.3C20.3907 20.3 20.0866 20.3983 19.8366 20.58L19.4523 20.86C18.7022 21.4053 17.7899 21.7 16.8523 21.7C15.9147 21.7 15.0024 21.4053 14.2523 20.86L13.8667 20.58C13.6166 20.3983 13.3125 20.3 13 20.3C12.6875 20.3 12.3834 20.3983 12.1333 20.58L11.7477 20.86C10.9976 21.4053 10.0853 21.7 9.14767 21.7C8.21006 21.7 7.29775 21.4053 6.54767 20.86L6.16344 20.58C5.91342 20.3983 5.60931 20.3 5.29678 20.3C4.98424 20.3 4.68014 20.3983 4.43011 20.58L3.46667 21.28C3.18243 21.49 2.84839 21.6276 2.49512 21.6802C2.14185 21.7328 1.78061 21.6987 1.44444 21.581Z"
                  fill="#3F55FF"
                />
              </svg>
            </div>

            {/* 년도 */}
            <div
              className="flex-1 relative min-w-0"
              style={{ height: "180px" }}
            >
              <div
                ref={yearRef}
                className="h-full overflow-y-scroll scrollbar-hide"
                onScroll={() =>
                  handleScroll(
                    yearRef,
                    years,
                    setYear,
                    false,
                    setCenterYearIndex,
                  )
                }
                onTouchEnd={() =>
                  handleScrollEnd(
                    yearRef,
                    years,
                    setYear,
                    false,
                    setCenterYearIndex,
                  )
                }
                onMouseUp={() =>
                  handleScrollEnd(
                    yearRef,
                    years,
                    setYear,
                    false,
                    setCenterYearIndex,
                  )
                }
                style={{
                  WebkitOverflowScrolling: "touch",
                  touchAction: "pan-y",
                }}
              >
                <div style={{ paddingTop: "60px", paddingBottom: "60px" }}>
                  {years.map((y, idx) => (
                    <div
                      key={y}
                      className="flex items-center justify-center"
                      style={{ height: ITEM_HEIGHT }}
                    >
                      <span
                        className={`text-[25px] font-bold transition-colors ${
                          idx === centerYearIndex
                            ? "text-[#363e4a]"
                            : "text-[#d0cfd0]"
                        }`}
                      >
                        {y}
                      </span>
                      <span
                        className={`text-[16px] font-medium transition-colors ml-[3px] ${
                          idx === centerYearIndex
                            ? "text-[#363e4a]"
                            : "text-[#d0cfd0]"
                        }`}
                      >
                          년
                        </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 월 */}
            <div
              className="flex-1 relative min-w-0"
              style={{ height: "180px" }}
            >
              <div
                ref={monthRef}
                className="h-full overflow-y-scroll scrollbar-hide"
                onScroll={() =>
                  handleScroll(
                    monthRef,
                    months,
                    setMonth,
                    false,
                    setCenterMonthIndex,
                  )
                }
                onTouchEnd={() =>
                  handleScrollEnd(
                    monthRef,
                    months,
                    setMonth,
                    false,
                    setCenterMonthIndex,
                  )
                }
                onMouseUp={() =>
                  handleScrollEnd(
                    monthRef,
                    months,
                    setMonth,
                    false,
                    setCenterMonthIndex,
                  )
                }
                style={{
                  WebkitOverflowScrolling: "touch",
                  touchAction: "pan-y",
                }}
              >
                <div style={{ paddingTop: "60px", paddingBottom: "60px" }}>
                  {months.map((m, idx) => (
                    <div
                      key={m}
                      className="flex items-center justify-center"
                      style={{ height: ITEM_HEIGHT }}
                    >
                      <span
                        className={`text-[25px] font-bold transition-colors ${
                          idx === centerMonthIndex
                            ? "text-[#363e4a]"
                            : "text-[#d0cfd0]"
                        }`}
                      >
                        {String(m).padStart(2, "0")}
                      </span>
                      <span
                        className={`text-[16px] font-medium transition-colors ml-[3px] ${
                          idx === centerMonthIndex
                            ? "text-[#363e4a]"
                            : "text-[#d0cfd0]"
                        }`}
                      >
                        월
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 일 */}
            <div
              className="flex-1 relative min-w-0"
              style={{ height: "180px" }}
            >
              <div
                ref={dayRef}
                className="h-full overflow-y-scroll scrollbar-hide"
                onScroll={() =>
                  handleScroll(dayRef, days, setDay, false, setCenterDayIndex)
                }
                onTouchEnd={() =>
                  handleScrollEnd(
                    dayRef,
                    days,
                    setDay,
                    false,
                    setCenterDayIndex,
                  )
                }
                onMouseUp={() =>
                  handleScrollEnd(
                    dayRef,
                    days,
                    setDay,
                    false,
                    setCenterDayIndex,
                  )
                }
                style={{
                  WebkitOverflowScrolling: "touch",
                  touchAction: "pan-y",
                }}
              >
                <div style={{ paddingTop: "60px", paddingBottom: "60px" }}>
                  {days.map((d, idx) => (
                    <div
                      key={d}
                      className="flex items-center justify-center"
                      style={{ height: ITEM_HEIGHT }}
                    >
                      <span
                        className={`text-[25px] font-bold transition-colors ${
                          idx === centerDayIndex
                            ? "text-[#363e4a]"
                            : "text-[#d0cfd0]"
                        }`}
                      >
                        {String(d).padStart(2, "0")}
                      </span>
                      <span
                        className={`text-[16px] font-medium transition-colors ml-[3px] ${
                          idx === centerDayIndex
                            ? "text-[#363e4a]"
                            : "text-[#d0cfd0]"
                        }`}
                      >
                        일
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 확인 버튼 */}
        <div className="px-[20px] pb-[25px] pt-[20px]">
          <button
            onClick={handleConfirm}
            className="w-full h-[59px] bg-[#3f55ff] hover:bg-[#3646e6] rounded-[7px] flex items-center justify-center transition-colors"
          >
            <span className="text-[16px] font-semibold text-white">확인</span>
          </button>
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
