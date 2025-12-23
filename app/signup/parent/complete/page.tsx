"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import MainContainer from "../../../components/MainContainer";
import { useSignupStore } from "../../../store/signupStore";

export default function ParentCompletePage() {
  const router = useRouter();
  const { isParentOnboardingCompleted } = useSignupStore();

  // 접근권한 체크 (선택사항 - parent는 로그인 없이 진행 가능할 수도 있음)
  useEffect(() => {
    // 온보딩 완료 여부 체크
    if (!isParentOnboardingCompleted()) {
      alert("잘못된 접근입니다.");
      router.push("/");
    }
  }, [router, isParentOnboardingCompleted]);

  const handleStart = () => {
    // 보호자 메인 페이지로 이동
    router.push("/parent");
  };

  return (
    <MainContainer>
      {/* 완료 메시지 영역 */}
      <div className="flex-1 flex flex-col items-center justify-center px-5">
        {/* 제목 */}
        <h1 className="text-[25px] font-bold text-gray-900 text-center mb-[45px]">
          댕댕이 등록 완료
        </h1>

        {/* 설명 */}
        <div className="text-[16px] font-medium text-[#6e7783] text-center leading-[20px] mb-[92px]">
          <p className="mb-0">이제 우리 아이의</p>
          <p>하루하루를 가볍게 챙겨보세요!</p>
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
