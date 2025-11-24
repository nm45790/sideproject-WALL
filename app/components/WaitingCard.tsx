"use client";

export default function WaitingCard() {
  return (
    <div className="bg-white rounded-[7px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] w-[315px] min-h-[458px] flex-shrink-0 snap-center flex flex-col items-center justify-center px-[20px]">
      {/* 메인 메시지 */}
      <div className="text-center mb-[25px]">
        <h3 className="text-[25px] font-bold text-[#363e4a] leading-[30px] mb-[8px]">
          우리 아이 유치원에서
        </h3>
        <h3 className="text-[25px] font-bold text-[#363e4a] leading-[30px]">
          확인 중이에요 💌
        </h3>
      </div>

      {/* 서브 메시지 */}
      <p className="text-[16px] font-medium text-[#858585] text-center">
        승인 완료 시 알림으로 알려드릴게요!
      </p>
    </div>
  );
}
