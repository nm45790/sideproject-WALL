"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MainContainer from "../../components/MainContainer";
import Icons from "../../components/Icons";
import { useSignupStore } from "../../store/signupStore";
import useDebouncedApi from "../../utils/debouncedApi";
import { authService } from "../../utils/auth";
import PageHeader from "@/app/components/PageHeader";

export default function AccountPage() {
  const router = useRouter();
  const {
    signupData,
    updateMemberId,
    updateMemberPassword,
    isSignupDataComplete,
  } = useSignupStore();

  // 필수 약관 동의 체크
  useEffect(() => {
    const requiredTerms = [
      signupData.termsSelectOption.service,
      signupData.termsSelectOption.privacy,
      signupData.termsSelectOption.thirdParty,
      signupData.termsSelectOption.payment,
    ];

    if (!requiredTerms.every(Boolean)) {
      alert("잘못된 접근입니다.");
      router.push("/signup/terms");
    }
  }, [router, signupData.termsSelectOption]);

  const [id, setId] = useState(signupData.memberId || "");
  const [password, setPassword] = useState(signupData.memberPassword || "");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isIdFocused, setIsIdFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [showPasswordGuide, setShowPasswordGuide] = useState(false);

  // 디바운스 API 훅 사용
  const api = useDebouncedApi();

  // localStorage에서 저장된 값으로 초기값 설정
  useEffect(() => {
    setId(signupData.memberId || "");
    setPassword(signupData.memberPassword || "");
  }, [signupData]);

  const handleGoBack = () => {
    router.back();
  };

  const handleIdChange = (value: string) => {
    // 영문자와 숫자만 허용
    const filteredValue = value.replace(/[^a-zA-Z0-9]/g, "");
    setId(filteredValue);
    updateMemberId(filteredValue);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    updateMemberPassword(value);
    setPasswordError("");
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    setPasswordError("");
  };

  const handlePasswordGuideToggle = () => {
    setShowPasswordGuide(!showPasswordGuide);
  };

  const handleNext = async () => {
    // 비밀번호 일치 검증
    if (password !== confirmPassword) {
      setPasswordError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (!isSignupDataComplete()) {
      return;
    }

    setIsLoading(true);

    try {
      // 회원가입 API 호출
      await api.execute({
        url: "/api/v1/members/step1",
        method: "POST",
        data: {
          memberId: signupData.memberId,
          memberPassword: signupData.memberPassword,
          memberPhone: signupData.memberPhone.replace(/-/g, ""), // 하이픈 제거
          memberName: signupData.memberName,
          memberEmail: signupData.memberEmail,
          agreeTerms: signupData.termsSelectOption.service,
          agreePrivacy: signupData.termsSelectOption.privacy,
          agreeMarketing: signupData.termsSelectOption.marketing,
        },
      });

      // 회원가입 성공 후 자동 로그인
      const loginResult = await authService.login({
        memberId: signupData.memberId,
        password: signupData.memberPassword,
      });

      if (loginResult.success) {
        alert("회원가입이 완료되었습니다!");
        // 로그인 성공 시 역할에 따라 리다이렉트
        if (loginResult.data?.data.role === "USER") {
          router.push("/guardian");
        } else if (loginResult.data?.data.role === "ACADEMY") {
          router.push("/academy");
        } else if (loginResult.data?.data.role === "TEMP") {
          router.push("/signup/role");
        } else {
          router.push("/signup/role");
        }
      } else {
        alert(
          "회원가입은 완료되었지만 자동 로그인에 실패했습니다. 다시 로그인해주세요.",
        );
        router.push("/login");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "회원가입에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    id.trim() !== "" &&
    password.trim() !== "" &&
    confirmPassword.trim() !== "" &&
    password === confirmPassword;

  return (
    <MainContainer>
      {/* 헤더 영역 - 뒤로가기 + 제목 */}
      <PageHeader title="회원가입" variant="back" onBack={handleGoBack} />

      {/* 입력 필드 영역 */}
      <div className="flex flex-col pt-11 text-base">
        {/* 아이디 입력 */}
        <div>
          <div className="mb-2">
            <span className="font-medium text-gray-900">아이디</span>
            <span className="font-medium text-[#ff3b30]">*</span>
          </div>
          <input
            type="text"
            value={id}
            onChange={(e) => handleIdChange(e.target.value)}
            onFocus={() => setIsIdFocused(true)}
            onBlur={() => setIsIdFocused(false)}
            placeholder="아이디를 입력해주세요"
            className={`w-full h-[59px] border-[1.5px] rounded-[7px] px-5 text-[16px] font-medium outline-none transition-colors ${
              isIdFocused || id ? "border-[#3f55ff]" : "border-[#d2d2d2]"
            } placeholder:text-[#d2d2d2] placeholder:font-medium`}
          />
        </div>

        {/* 비밀번호 입력 */}
        <div className="pt-6">
          <div className="mb-2 text-base">
            <span className="font-medium text-gray-900">비밀번호</span>
            <span className="font-medium text-[#ff3b30]">*</span>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
            onFocus={() => setIsPasswordFocused(true)}
            onBlur={() => setIsPasswordFocused(false)}
            placeholder="비밀번호를 입력해주세요"
            className={`w-full h-[59px] border-[1.5px] rounded-[7px] px-5 text-[16px] font-medium outline-none transition-colors ${
              isPasswordFocused || password
                ? "border-[#3f55ff]"
                : "border-[#d2d2d2]"
            } placeholder:text-[#d2d2d2] placeholder:font-medium`}
          />
        </div>

        {/* 비밀번호 재입력 */}
        <div className="pt-6">
          <div className="mb-2">
            <span className="font-medium text-gray-900">비밀번호 재입력</span>
            <span className="font-medium text-[#ff3b30]">*</span>
          </div>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => handleConfirmPasswordChange(e.target.value)}
            onFocus={() => setIsConfirmPasswordFocused(true)}
            onBlur={() => setIsConfirmPasswordFocused(false)}
            placeholder="동일한 비밀번호를 입력해주세요"
            className={`w-full h-[59px] border-[1.5px] rounded-[7px] px-5 text-[16px] font-medium outline-none transition-colors ${
              isConfirmPasswordFocused || confirmPassword
                ? "border-[#3f55ff]"
                : "border-[#d2d2d2]"
            } placeholder:text-[#d2d2d2] placeholder:font-medium`}
          />
          {/* 비밀번호 일치 오류 메시지 */}
          {passwordError && (
            <div className="mt-2">
              <p className="text-red-500 text-sm font-medium">
                {passwordError}
              </p>
            </div>
          )}

          {/* 비밀번호 설정 안내 버튼 */}
          <div className="mt-3 flex justify-end">
            <button
              onClick={handlePasswordGuideToggle}
              className="flex items-center text-[14px] font-normal text-[#b4b4b4] underline"
            >
              비밀번호 설정 안내
            </button>
          </div>
        </div>
      </div>

      {/* 회원가입 완료 버튼 */}
      <div className="flex-1 flex items-end pb-5">
        <button
          onClick={handleNext}
          disabled={!isFormValid || isLoading}
          className={`w-full h-[59px] rounded-[7px] flex items-center justify-center transition-colors ${
            isFormValid && !isLoading
              ? "bg-[#3f55ff] hover:bg-[#3646e6] cursor-pointer"
              : "bg-[#f0f0f0] cursor-not-allowed"
          }`}
        >
          <span className="font-semibold text-[16px] text-white">
            {isLoading ? "가입중..." : "가입하기"}
          </span>
        </button>
      </div>

      {/* 비밀번호 설정 안내 모달 */}
      {showPasswordGuide && (
        <div className="fixed inset-0 z-[9999] flex items-end">
          {/* 백드롭 */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={handlePasswordGuideToggle}
          />

          {/* 모달 컨텐츠 */}
          <div className="relative bg-white rounded-t-[20px] w-full h-[414px] animate-slide-up z-[10000]">
            {/* 제목 */}
            <div className="flex items-center px-5 py-6">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 mr-2"
              >
                <path
                  d="M15 7H14V5C14 2.23858 11.7614 0 9 0C6.23858 0 4 2.23858 4 5V7H3C2.44772 7 2 7.44772 2 8V17C2 17.5523 2.44772 18 3 18H15C15.5523 18 16 17.5523 16 17V8C16 7.44772 15.5523 7 15 7ZM6 5C6 3.34315 7.34315 2 9 2C10.6569 2 12 3.34315 12 5V7H6V5ZM15 16H3V9H15V16Z"
                  fill="#005ab4"
                />
              </svg>
              <h3 className="text-[15px] font-bold text-[#005ab4]">
                비밀번호 설정 시 유의사항
              </h3>
            </div>

            {/* 구분선 */}
            <div className="mx-5 h-px bg-[#d2d2d2]"></div>

            {/* 안내 내용 */}
            <div className="px-3 py-6">
              <ul className="space-y-4 text-[16px] font-medium text-gray-900">
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-gray-900 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>
                    비밀번호는 8 ~ 32자의 영문 대소문자, 숫자, 특수문자를
                    포함하여 설정해 주세요.
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-gray-900 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>
                    다른 사이트에서 사용하는 것과 동일하거나 쉬운 비밀번호는
                    사용하지 마세요.
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-gray-900 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>
                    안전한 계정 사용을 위해 비밀번호는 주기적으로 변경해주세요.
                  </span>
                </li>
              </ul>
            </div>

            {/* 확인 버튼 */}
            <div className="absolute bottom-0 left-0 right-0">
              <button
                onClick={handlePasswordGuideToggle}
                className="w-full h-[59px] bg-[#3f55ff] flex items-center justify-center"
              >
                <span className="text-[16px] font-semibold text-white">
                  확인
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </MainContainer>
  );
}
