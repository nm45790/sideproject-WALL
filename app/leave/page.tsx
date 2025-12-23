"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../components/CombinedProvider";
import { tokenManager } from "../utils/cookies";
import { api } from "../utils/api";
import MainContainer from "../components/MainContainer";
import Icons from "../components/Icons";

export default function LeavePage() {
  const router = useRouter();
  const [isAgreed, setIsAgreed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // 회원탈퇴 처리
  const handleLeave = async () => {
    if (!isAgreed) {
      return;
    }

    if (
      !confirm(
        "정말 탈퇴하시겠습니까?\n모든 데이터가 삭제되며 복구할 수 없습니다.",
      )
    ) {
      return;
    }

    try {
      setIsProcessing(true);

      // 회원탈퇴 API 호출
      const response = await api.post<{
        code: number;
        data: {
          success: boolean;
          message: string;
        };
      }>("/api/v1/members/withdraw");

      if (response.success && response.data?.data?.success) {
        // 성공 메시지 표시
        alert(response.data.data.message || "탈퇴 처리가 완료되었습니다.");

        // 토큰 및 사용자 정보 삭제
        tokenManager.clearTokens();

        // 메인 페이지로 이동
        router.push("/");
      } else {
        throw new Error(response.error || "회원탈퇴에 실패했습니다.");
      }
    } catch (error) {
      console.error("회원탈퇴 실패:", error);
      alert(
        error instanceof Error
          ? error.message
          : "회원탈퇴에 실패했습니다. 다시 시도해주세요.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // 취소하기
  const handleCancel = () => {
    router.back();
  };

  return (
    <MainContainer bg="#ffffff" noPadding>
      <div className="w-full min-h-dvh">
        {/* 뒤로가기 버튼 */}
        <div className="pt-[73px] px-[20px] pb-[27px]">
          <button
            onClick={() => router.back()}
            className="hover:opacity-70 transition-opacity"
          >
            <Icons.Prev className="w-[26px] h-[22px]" />
          </button>
        </div>

        {/* 제목 */}
        <div className="px-[20px] mb-[179px]">
          <h1 className="font-bold text-gray-900 text-[20px] leading-[normal]">
            회원탈퇴
          </h1>
        </div>

        {/* 메인 안내 문구 */}
        <div className="px-[20px] mb-[79px]">
          <p className="font-bold text-gray-900 text-[20px] leading-[normal] text-center">
            회원 탈퇴 시
            <br />
            고객님의 모든 정보가 소멸되며
            <br />
            이전으로 <span className="text-[#e55647]">복구 불가능</span> 합니다.
          </p>
        </div>

        {/* 세부 안내 사항 */}
        <div className="px-[15px] mb-[19px]">
          <ul className="space-y-[12px] list-disc ml-[19.5px]">
            <li>
              <p className="font-medium text-[#8e8e8e] text-[13px] leading-[normal]">
                &bull; 탈퇴 이후 데이터 삭제로 인해 고객센터 대응에 어려움이
                있을 수 있습니다.
              </p>
            </li>
            <li>
              <p className="font-medium text-[#8e8e8e] text-[13px] leading-[normal]">
                &bull; 탈퇴 시 60일간 동일 계정과 번호로 회원가입을 할 수
                없습니다.
              </p>
            </li>
          </ul>
        </div>

        {/* 동의 체크박스 */}
        <div className="px-[20px]">
          <button
            onClick={() => setIsAgreed(!isAgreed)}
            className="flex items-center gap-[8px] w-full"
          >
            <div
              className={`w-[20px] h-[20px] rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                isAgreed
                  ? "bg-gray-900 border-gray-900"
                  : "bg-white border-[#d1d5db]"
              }`}
            >
              {isAgreed && (
                <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                  <path
                    d="M1 4.5L4 7.5L11 1"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <p className="font-bold text-[#8e8e8e] text-[16px] leading-[normal]">
              안내 사항을 모두 확인했으면 동의합니다.
            </p>
          </button>
        </div>

        {/* 버튼 */}
        <div className="px-[20px] mt-[47.5px] flex gap-[12px]">
          <button
            onClick={handleLeave}
            disabled={!isAgreed || isProcessing}
            className={`flex-1 h-[59px] rounded-[7px] flex items-center justify-center transition-all ${
              isAgreed && !isProcessing
                ? "bg-[#3F55FF] hover:bg-[#3646e6] cursor-pointer"
                : "bg-[#e5e5e5] cursor-not-allowed"
            }`}
          >
            <span
              className={`font-semibold text-[16px] ${
                isAgreed && !isProcessing ? "text-white" : "text-[#9ca3af]"
              }`}
            >
              {isProcessing ? "처리 중..." : "탈퇴하기"}
            </span>
          </button>
          <button
            onClick={handleCancel}
            disabled={isProcessing}
            className="flex-1 h-[59px] bg-[#3E304A] rounded-[7px] flex items-center justify-center hover:bg-[#d5d5d5] transition-colors"
          >
            <span className="font-semibold text-[#FFF] text-[16px]">
              취소하기
            </span>
          </button>
        </div>
      </div>
    </MainContainer>
  );
}
