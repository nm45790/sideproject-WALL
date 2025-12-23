"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MainContainer from "../../../components/MainContainer";
import Icons from "../../../components/Icons";
import { useSignupStore } from "../../../store/signupStore";
import { authService } from "../../../utils/auth";
import {
  daysOfWeek,
  generateHourOptions,
  generateMinuteOptions,
} from "@/app/utils/schedule";

interface ScheduleItem {
  dayOfWeek: string;
  isOpen: boolean;
  operatingStartTime: string;
  operatingEndTime: string;
}

export default function AcademySchedulePage() {
  const router = useRouter();
  const { signupData, updateScheduleList, isAcademyOnboardingCompleted } =
    useSignupStore();

  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);

  const userInfo = authService.getCurrentUserInfo();

  const hourOptions = generateHourOptions();
  const minuteOptions = generateMinuteOptions();

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

  // 초기 스케줄 데이터 설정
  useEffect(() => {
    if (signupData.scheduleList && signupData.scheduleList.length > 0) {
      setSchedules(signupData.scheduleList);
    } else {
      // 기본 스케줄 데이터 생성
      const defaultSchedules = daysOfWeek.map((day) => ({
        dayOfWeek: day.key,
        isOpen: day.key !== "SUN", // 일요일은 기본적으로 닫힘
        operatingStartTime: "09:00",
        operatingEndTime: "18:00",
      }));
      setSchedules(defaultSchedules);
      // signupStore에도 기본값 저장
      updateScheduleList(defaultSchedules);
    }
  }, [signupData.scheduleList, updateScheduleList]);

  const handleGoBack = () => {
    router.back();
  };

  const toggleDay = (dayOfWeek: string) => {
    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.dayOfWeek === dayOfWeek
          ? { ...schedule, isOpen: !schedule.isOpen }
          : schedule,
      ),
    );
  };

  const updateSchedule = (
    dayOfWeek: string,
    field: keyof ScheduleItem,
    value: any,
  ) => {
    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.dayOfWeek === dayOfWeek
          ? { ...schedule, [field]: value }
          : schedule,
      ),
    );
  };

  const handleNext = () => {
    // 스케줄 데이터를 store에 저장
    updateScheduleList(schedules);

    // 다음 페이지로 이동
    router.push("/signup/academy/capacity");
  };

  return (
    <MainContainer>
      {/* 헤더 영역 - 뒤로가기 */}
      <div className="flex items-center pt-[45px] pb-[20px]">
        <button
          onClick={handleGoBack}
          className="p-[18px] w-[57px] h-[57px] flex items-center justify-center -ml-[18px]"
        >
          <Icons.Prev className="w-[26px] h-[22px]" />
        </button>
      </div>

      {/* 제목 영역 */}
      <div className="mb-[8px]">
        <h2 className="text-[25px] font-bold text-gray-900 leading-[30px] mb-[8px]">
          운영 정보는 어떻게 되나요?
        </h2>
        <p className="text-[16px] font-medium text-[#858585] leading-[20px]">
          운영하는 요일과 시간을 입력해 주세요
        </p>
      </div>

      {/* 스케줄 리스트 */}
      <div className="flex-1 flex flex-col space-y-[15px] mt-[53px]">
        {daysOfWeek.map((day, index) => {
          const schedule = schedules.find((s) => s.dayOfWeek === day.key);
          if (!schedule) return null;

          return (
            <div key={day.key} className="w-full">
              {/* 요일 라벨 */}
              <p className={`text-[16px] font-bold mb-[7px] ${day.color}`}>
                {day.label}
              </p>

              {/* 스케줄 카드 */}
              <div className="bg-white rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] p-5">
                {/* 영업일 토글 */}
                <div className="flex items-center justify-between mb-[14px]">
                  <span className="text-[16px] font-bold text-gray-900">
                    영업일
                  </span>
                  <button
                    onClick={() => toggleDay(day.key)}
                    className={`relative w-[37px] h-[19px] rounded-full transition-colors ${
                      schedule.isOpen ? "bg-[#3f55ff]" : "bg-[#d2d2d2]"
                    }`}
                  >
                    <div
                      className={`absolute top-[2px] w-[15px] h-[15px] bg-white rounded-full transition-transform ${
                        schedule.isOpen
                          ? "translate-x-[18px]"
                          : "translate-x-[2px]"
                      }`}
                    />
                  </button>
                </div>

                {/* 시간 선택 영역 */}
                <div className="space-y-[15px]">
                  {/* 시작 시간 */}
                  <div className="flex items-center space-x-[8px]">
                    <p className="text-[12px] font-medium text-[#8e8e8e] w-[30px] flex-shrink-0">
                      시작
                    </p>
                    <div className="flex space-x-[8px] flex-1">
                      {/* 시간 선택 */}
                      <select
                        value={schedule.operatingStartTime.split(":")[0]}
                        onChange={(e) => {
                          const minute =
                            schedule.operatingStartTime.split(":")[1];
                          updateSchedule(
                            day.key,
                            "operatingStartTime",
                            `${e.target.value}:${minute}`,
                          );
                        }}
                        disabled={!schedule.isOpen}
                        className={`flex-1 h-[42px] border-[1.5px] rounded-[7px] px-5 pr-8 text-[16px] font-bold outline-none transition-colors appearance-none ${
                          schedule.isOpen
                            ? "border-[#d2d2d2] bg-white text-[#6e7783]"
                            : "border-[#d2d2d2] bg-[#f0f0f0] text-[#d2d2d2]"
                        }`}
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: "right 8px center",
                          backgroundRepeat: "no-repeat",
                          backgroundSize: "16px",
                        }}
                      >
                        {hourOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>

                      {/* 분 선택 */}
                      <select
                        value={schedule.operatingStartTime.split(":")[1]}
                        onChange={(e) => {
                          const hour =
                            schedule.operatingStartTime.split(":")[0];
                          updateSchedule(
                            day.key,
                            "operatingStartTime",
                            `${hour}:${e.target.value}`,
                          );
                        }}
                        disabled={!schedule.isOpen}
                        className={`w-[107px] h-[42px] border-[1.5px] rounded-[7px] px-5 pr-8 text-[16px] font-bold outline-none transition-colors appearance-none ${
                          schedule.isOpen
                            ? "border-[#d2d2d2] bg-white text-[#6e7783]"
                            : "border-[#d2d2d2] bg-[#f0f0f0] text-[#d2d2d2]"
                        }`}
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: "right 8px center",
                          backgroundRepeat: "no-repeat",
                          backgroundSize: "16px",
                        }}
                      >
                        {minuteOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 종료 시간 */}
                  <div className="flex items-center space-x-[8px]">
                    <p className="text-[12px] font-medium text-[#8e8e8e] w-[30px] flex-shrink-0">
                      종료
                    </p>
                    <div className="flex space-x-[8px] flex-1">
                      {/* 시간 선택 */}
                      <select
                        value={schedule.operatingEndTime.split(":")[0]}
                        onChange={(e) => {
                          const minute =
                            schedule.operatingEndTime.split(":")[1];
                          updateSchedule(
                            day.key,
                            "operatingEndTime",
                            `${e.target.value}:${minute}`,
                          );
                        }}
                        disabled={!schedule.isOpen}
                        className={`flex-1 h-[42px] border-[1.5px] rounded-[7px] px-5 pr-8 text-[16px] font-bold outline-none transition-colors appearance-none ${
                          schedule.isOpen
                            ? "border-[#d2d2d2] bg-white text-[#6e7783]"
                            : "border-[#d2d2d2] bg-[#f0f0f0] text-[#d2d2d2]"
                        }`}
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: "right 8px center",
                          backgroundRepeat: "no-repeat",
                          backgroundSize: "16px",
                        }}
                      >
                        {hourOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>

                      {/* 분 선택 */}
                      <select
                        value={schedule.operatingEndTime.split(":")[1]}
                        onChange={(e) => {
                          const hour = schedule.operatingEndTime.split(":")[0];
                          updateSchedule(
                            day.key,
                            "operatingEndTime",
                            `${hour}:${e.target.value}`,
                          );
                        }}
                        disabled={!schedule.isOpen}
                        className={`w-[107px] h-[42px] border-[1.5px] rounded-[7px] px-5 pr-8 text-[16px] font-bold outline-none transition-colors appearance-none ${
                          schedule.isOpen
                            ? "border-[#d2d2d2] bg-white text-[#6e7783]"
                            : "border-[#d2d2d2] bg-[#f0f0f0] text-[#d2d2d2]"
                        }`}
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: "right 8px center",
                          backgroundRepeat: "no-repeat",
                          backgroundSize: "16px",
                        }}
                      >
                        {minuteOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 다음 버튼 */}
      <div className="mt-[25px] pb-[25px]">
        <button
          onClick={handleNext}
          className="w-full h-[59px] rounded-[7px] bg-[#3f55ff] hover:bg-[#3646e6] flex items-center justify-center transition-colors"
        >
          <span className="font-semibold text-[16px] text-white">다음</span>
        </button>
      </div>
    </MainContainer>
  );
}
