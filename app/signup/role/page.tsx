"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MainContainer from "../../components/MainContainer";
import PageHeader from "../../components/PageHeader";
import { useSignupStore } from "../../store/signupStore";
import { authService } from "../../utils/auth";
import { api } from "../../utils/api";

export default function RolePage() {
  const router = useRouter();
  const { signupData } = useSignupStore();
  const [selectedRole, setSelectedRole] = useState<"PARENT" | "ACADEMY" | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userInfo = authService.getCurrentUserInfo();

  // 필수 약관 동의 체크
  // useEffect(() => {
  //   // 접근권한 체크(TEMP인 경우만 접근 가능)
  //   if (!userInfo) {
  //     alert("잘못된 접근입니다.");
  //     router.push("/");
  //   } else if (userInfo.role !== "TEMP") {
  //     alert("잘못된 접근입니다.");
  //     router.push("/");
  //   }
  // }, [router, signupData.termsSelectOption, userInfo]);

  const handleSelect = async (role: "PARENT" | "ACADEMY") => {
    if (isSubmitting) return;
    setSelectedRole(role);
    setIsSubmitting(true);

    try {
      const res = await api.post(
        "/api/v1/members/step2",
        { role },
        { requireAuth: true },
      );

      if (!res.success) throw new Error(res.error || "역할 설정 실패");

      authService.updateUserInfo({ role });

      if (role === "PARENT") {
        router.push("/signup/parent");
      } else {
        router.push("/signup/academy/onboarding");
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "역할 설정에 실패했습니다.");
      setSelectedRole(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainContainer>
      {/* 헤더 */}
      <PageHeader />

      {/* 타이틀 */}
      <div className="pt-[32px] pb-[28px]">
        <h1 className="text-[25px] font-bold text-gray-900 leading-[30px] mb-2">
          당신은 어떤 사용자이신가요?
        </h1>
        <p className="text-[16px] text-[#858585]">
          보호자의 유형을 선택해 주세요
        </p>
      </div>

      {/* 옵션 카드들 */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => handleSelect("PARENT")}
          className={`w-full bg-white rounded-[10px] border transition-all text-left shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] px-5 py-4 flex items-center justify-between ${
            selectedRole === "PARENT" ? "border-[#3f55ff]" : "border-[#f2f2f2]"
          }`}
        >
          <div>
            <p className="text-[20px] font-bold text-black">보호자</p>
            <p className="text-[13px] text-[#858585] mt-1">
              반려견을 키우고 있어요
            </p>
          </div>
          <div
            className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-300 ${
              selectedRole === "PARENT"
                ? "bg-[#3f55ff] border-[#3f55ff] scale-110 animate-pop"
                : "border-[#e5e5e5]"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full transition-all duration-300 ${selectedRole === "PARENT" ? "bg-white scale-100" : "bg-transparent scale-0"}`}
            />
          </div>
        </button>

        <button
          onClick={() => handleSelect("ACADEMY")}
          className={`w-full bg-white rounded-[10px] border transition-all text-left shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] px-5 py-4 flex items-center justify-between ${
            selectedRole === "ACADEMY" ? "border-[#3f55ff]" : "border-[#f2f2f2]"
          }`}
        >
          <div>
            <p className="text-[20px] font-bold text-black">유치원</p>
            <p className="text-[13px] text-[#858585] mt-1">
              반려견 유치원을 운영하고 있어요
            </p>
          </div>
          <div
            className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all duration-300 ${
              selectedRole === "ACADEMY"
                ? "bg-[#3f55ff] border-[#3f55ff] scale-110 animate-pop"
                : "border-[#e5e5e5]"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full transition-all duration-300 ${selectedRole === "ACADEMY" ? "bg-white scale-100" : "bg-transparent scale-0"}`}
            />
          </div>
        </button>
      </div>
    </MainContainer>
  );
}
