"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import MainContainer from "../../../components/MainContainer";
import { authService } from "../../../utils/auth";
import { useSignupStore } from "../../../store/signupStore";

export default function AcademyCompletePage() {
  const router = useRouter();
  const { isAcademyOnboardingCompleted } = useSignupStore();

  const userInfo = authService.getCurrentUserInfo();

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

  const handleStart = () => {
    // 유치원 메인 페이지로 이동
    router.push("/academy");
  };

  return (
    <MainContainer>
      {/* 완료 메시지 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center px-5">
        {/* 제목 */}
        <h1 className="text-[25px] font-bold text-gray-900 text-center mb-[45px]">
          유치원 등록 완료
        </h1>

        {/* 설명 */}
        <div className="text-[16px] font-medium text-[#6e7783] text-center leading-[20px] mb-[92px]">
          <p className="mb-0">이젠 보호자와 반려견이</p>
          <p>우리 유치원을 만날 수 있어요!</p>
        </div>
      </div>

      {/* 시작하기 버튼 */}
      <div className="px-5 pb-8">
        <button
          onClick={handleStart}
          className="w-full h-[59px] bg-[#3f55ff] hover:bg-[#3646e6] rounded-[7px] flex items-center justify-center transition-colors"
        >
          <span className="font-semibold text-[16px] text-white">시작하기</span>
        </button>
      </div>
    </MainContainer>
  );
}
