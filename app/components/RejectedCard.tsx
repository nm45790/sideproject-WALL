"use client";

import { useRouter } from "next/navigation";
import { useSignupStore } from "../store/signupStore";

export default function RejectedCard() {
  const router = useRouter();
  const { setIsAddingPet } = useSignupStore();

  const handleFindAcademy = () => {
    // 강아지 추가 모드로 설정하여 접근 권한 체크 우회
    setIsAddingPet(true);
    router.push("/signup/parent/academy");
  };

  return (
    <div className="bg-white rounded-[7px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] w-[315px] min-h-[458px] flex-shrink-0 snap-center flex flex-col items-center justify-center px-[20px] relative">
      {/* 메인 메시지 */}
      <div className="text-center mb-[25px]">
        <h3 className="text-[25px] font-bold text-gray-900 leading-[30px]">
          승인 거절
        </h3>
      </div>

      {/* 서브 메시지 */}
      <div className="text-center mb-[100px]">
        <p className="text-[16px] font-medium text-[#858585]">
          유치원을 잘못 선택한 것 같아요.
        </p>
        <p className="text-[16px] font-medium text-[#858585]">
          다시 한 번 유치원을 선택해보세요!
        </p>
      </div>

      {/* 유치원 찾기 버튼 */}
      <div className="absolute bottom-[20px] left-[20px] right-[20px]">
        <button
          onClick={handleFindAcademy}
          className="w-full h-[59px] bg-[#342c43] rounded-[7px] flex items-center justify-center hover:bg-opacity-90 transition-colors"
        >
          <span className="text-[16px] font-semibold text-white">
            유치원 찾기
          </span>
        </button>
      </div>
    </div>
  );
}
