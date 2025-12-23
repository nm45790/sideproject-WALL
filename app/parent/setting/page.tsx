"use client";

import { useRouter } from "next/navigation";
import MainContainer from "../../components/MainContainer";
import Icons from "../../components/Icons";
import { useAuth } from "../../components/CombinedProvider";
import { authService } from "../../utils/auth";

export default function ParentSettingPage() {
  const router = useRouter();
  const userInfo = useAuth();

  // 로그아웃
  const handleLogout = () => {
    if (confirm("로그아웃 하시겠습니까?")) {
      authService.logout();
    }
  };

  // 회원탈퇴
  const handleWithdraw = () => {
    router.push("/leave");
  };

  return (
    <MainContainer bg="#ffffff" noPadding>
      <div className="w-full min-h-dvh pb-[150px]">
        {/* 뒤로가기 버튼 - Sticky */}
        <div className="bg-white sticky top-0 z-10">
          <div className="pt-[73px] px-[20px] pb-[20px]">
            <button
              onClick={() => router.back()}
              className="hover:opacity-70 transition-opacity"
            >
              <Icons.Prev className="w-[26px] h-[22px]" />
            </button>
          </div>
        </div>

        {/* 제목 */}
        <div className="bg-white px-[20px] pb-[20px]">
          <p className="font-bold text-gray-900 text-[20px] leading-[normal]">
            사용자 정보
          </p>
        </div>

        {/* 구분선 */}
        <div className="w-full h-[1px] bg-[#d2d6db]" />

        {/* 컨텐츠 */}
        <div className="px-[20px] pt-[60px]">
          {/* 사용자 정보 */}
          <div className="grid grid-cols-2 gap-y-[32px] mb-[340px]">
            {/* 이름 */}
            <div>
              <p className="font-semibold text-[#6e7783] text-[14px] leading-[normal]">
                이름
              </p>
            </div>
            <div>
              <p className="font-semibold text-[#6e7783] text-[14px] leading-[normal]">
                {userInfo?.name || "-"}
              </p>
            </div>

            {/* 휴대폰 번호 */}
            <div>
              <p className="font-semibold text-[#6e7783] text-[14px] leading-[normal]">
                휴대폰 번호
              </p>
            </div>
            <div>
              <p className="font-semibold text-[#6e7783] text-[14px] leading-[normal]">
                {userInfo?.memberPhone || "-"}
              </p>
            </div>
          </div>

          {/* 회원탈퇴 / 로그아웃 */}
          <div className="flex items-center justify-center gap-[16px] mb-[40px]">
            <button
              onClick={handleWithdraw}
              className="font-medium text-[#8e8e8e] text-[16px] hover:text-gray-900 transition-colors"
            >
              회원탈퇴
            </button>
            <div className="w-[1px] h-[14px] bg-[#d2d2d2]" />
            <button
              onClick={handleLogout}
              className="font-medium text-[#8e8e8e] text-[16px] hover:text-gray-900 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white px-[20px] py-[25px]">
        <button
          onClick={() => router.back()}
          className="w-full h-[59px] rounded-[7px] flex items-center justify-center transition-colors bg-[#3f55ff] hover:bg-[#3646e6] cursor-pointer"
        >
          <span className="font-semibold text-white text-[16px]">저장하기</span>
        </button>
      </div>
    </MainContainer>
  );
}
