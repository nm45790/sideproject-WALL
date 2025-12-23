"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MainContainer from "../../../components/MainContainer";
import Icons from "../../../components/Icons";

export default function FindIdResultPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const memberId = searchParams.get("memberId") || "";
  const memberName = searchParams.get("memberName") || "";

  // 아이디가 없으면 첫 페이지로 리다이렉트
  useEffect(() => {
    if (!memberId) {
      alert("잘못된 접근입니다.");
      router.push("/find/id");
    }
  }, [memberId, router]);

  const handleGoBack = () => {
    router.push("/login");
  };

  const handleGoToLogin = () => {
    router.push("/login");
  };

  const handleFindPassword = () => {
    router.push("/find/password");
  };

  return (
    <MainContainer>
      {/* 헤더 영역 - 뒤로가기 + 제목 */}
      <div className="relative flex items-center justify-center h-[93px]">
        <button
          onClick={handleGoBack}
          className="absolute left-0 top-[63px] w-[26px] h-[22px] flex items-center justify-center"
        >
          <Icons.Prev className="w-[26px] h-[22px]" />
        </button>
        <h1 className="absolute top-[64px] text-[18px] font-bold text-gray-900 leading-[normal]">
          아이디 찾기
        </h1>
      </div>

      {/* 결과 표시 영역 */}
      <div className="flex-1 flex flex-col pt-[48px]">
        {/* 성공 메시지 */}
        <div className="mb-[6px]">
          <p className="text-[18px] font-bold text-gray-900 leading-[normal]">
            고객님의 왈 계정을 찾았습니다.
          </p>
        </div>
        <div className="mb-[33px]">
          <p className="text-[13px] font-medium text-[#b4b4b4] leading-[normal]">
            아이디 확인 후 로그인해 주세요.
          </p>
        </div>

        {/* 아이디 표시 카드 (라디오 버튼 스타일) */}
        <div className="mb-[24px]">
          <div className="w-full flex items-center gap-[10px] py-[9px]">
            {/* 라디오 버튼 */}
            <div className="w-[20px] h-[20px] rounded-full border-[1.5px] border-[#3f55ff] flex items-center justify-center flex-shrink-0">
              <div className="w-[10px] h-[10px] rounded-full bg-[#3f55ff]"></div>
            </div>
            {/* 아이디 정보 */}
            <div className="flex flex-col gap-[3px]">
              <span className="text-[16px] font-medium text-gray-900 leading-[normal]">
                {memberId}
              </span>
              <span className="text-[13px] font-medium text-[#b4b4b4] leading-[normal]">
                가입일 2024.10.27
              </span>
            </div>
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className="flex flex-col gap-[10px] mt-auto mb-[20px]">
          {/* 비밀번호 찾기 버튼 */}
          <button
            onClick={handleFindPassword}
            className="w-full h-[59px] bg-[#e2f8ff] hover:bg-[#d0edff] rounded-[7px] flex items-center justify-center transition-colors"
          >
            <span className="font-semibold text-[16px] text-[#3f55ff]">
              비밀번호 찾기
            </span>
          </button>

          {/* 로그인하기 버튼 */}
          <button
            onClick={handleGoToLogin}
            className="w-full h-[59px] bg-[#3f55ff] hover:bg-[#3646e6] rounded-[7px] flex items-center justify-center transition-colors"
          >
            <span className="font-semibold text-[16px] text-white">로그인</span>
          </button>
        </div>
      </div>
    </MainContainer>
  );
}
