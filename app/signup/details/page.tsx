"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MainContainer from "../../components/MainContainer";
import Icons from "../../components/Icons";
import { useSignupStore } from "../../store/signupStore";
import useDebouncedRequest from "../../hooks/useDebouncedRequest";

export default function DetailsPage() {
  const router = useRouter();
  const {
    signupData,
    updateMemberName,
    updateMemberPhone,
    updateMemberEmail,
    isDetailsDataComplete,
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

  const [name, setName] = useState(signupData.memberName || "");
  const [phone, setPhone] = useState(signupData.memberPhone || "");
  const [email, setEmail] = useState(signupData.memberEmail || "");
  const [emailDomain, setEmailDomain] = useState("");
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 디바운스 API 훅 사용
  const debouncedApi = useDebouncedRequest();

  // localStorage에서 저장된 값으로 초기값 설정
  useEffect(() => {
    setName(signupData.memberName || "");
    setPhone(signupData.memberPhone || "");

    // 이메일 처리
    if (signupData.memberEmail && signupData.memberEmail.includes("@")) {
      const [emailId, domain] = signupData.memberEmail.split("@");
      setEmail(emailId);
      // 도메인이 선택된 옵션 중 하나인지 확인
      const validDomains = [
        "gmail.com",
        "naver.com",
        "hanmail.net",
        "kakao.com",
        "daum.net",
      ];
      if (validDomains.includes(domain)) {
        setEmailDomain(domain);
      } else {
        setEmailDomain("직접입력");
        setEmail(signupData.memberEmail); // 전체 이메일을 그대로 표시
      }
    } else {
      setEmail(signupData.memberEmail || "");
      if (emailDomain !== "직접입력") {
        setEmailDomain("");
      }
    }
  }, [signupData]);

  const handleGoBack = () => {
    router.back();
  };

  const handleNameChange = (value: string) => {
    // 한글과 영어만 허용 (특수문자, 숫자 제거)
    // 더 넓은 범위의 한글 문자 포함 (자모, 완성형, 호환형)
    const filteredValue = value.replace(/[^가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z\s]/g, "");
    setName(filteredValue);
    updateMemberName(filteredValue);
  };

  const formatPhoneNumber = (value: string) => {
    // 숫자만 추출
    const numbers = value.replace(/\D/g, "");

    // 길이에 따라 하이픈 추가
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setPhone(formatted);
    updateMemberPhone(formatted);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    // 직접 입력인 경우에만 전체 이메일로 저장 (이미 @ 포함된 경우)
    if (emailDomain === "직접입력") {
      updateMemberEmail(value);
    } else if (emailDomain && emailDomain !== "") {
      // 선택된 도메인이 있으면 조합해서 저장
      const emailId = value;
      updateMemberEmail(`${emailId}@${emailDomain}`);
    }
  };

  const handleEmailDomainChange = (value: string) => {
    setEmailDomain(value);
    if (value === "직접입력") {
      // 직접입력 선택 시 현재 이메일 그대로 유지하고 emailDomain을 "직접입력"으로 유지
      updateMemberEmail(email);
    } else if (value && value !== "") {
      // 도메인 선택 시 아이디와 조합
      const emailId = email.split("@")[0] || "";
      updateMemberEmail(`${emailId}@${value}`);
    }
  };

  const handleNext = async () => {
    console.log("handleNext");
    if (!isDetailsDataComplete()) {
      return;
    }

    if (!signupData.memberPhone) {
      alert("전화번호가 없습니다.");
      return;
    }

    setIsLoading(true);

    try {
      // 중복 체크 먼저 실행 (운영에서만)
      if (process.env.NEXT_PUBLIC_ENV === "production") {
        const checkResult = await debouncedApi.executeImmediately(
          "post",
          "/api/v1/members/check-unique",
          {
            name: signupData.memberName,
            email: signupData.memberEmail,
            phone: signupData.memberPhone,
          },
        );

        if (!checkResult?.success) {
          alert("이미 가입된 정보가 있습니다.");
          return;
        }
      }

      // 중복 체크 통과 후 인증번호 발송
      await debouncedApi.executeImmediately(
        "post",
        "/api/v1/phone-verification/send-code",
        { phoneNumber: signupData.memberPhone.replace(/-/g, "") },
      );

      alert("인증번호가 발송되었습니다.");
      router.push("/signup/verify");
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "인증번호 발송에 실패했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    name.trim() !== "" && phone.trim() !== "" && email.trim() !== "";

  return (
    <MainContainer>
      {/* 헤더 영역 - 뒤로가기 + 제목 */}
      <div className="flex items-center pt-[45px] pb-[20px]">
        <button
          onClick={handleGoBack}
          className="p-[18px] w-[57px] h-[57px] flex items-center justify-center -ml-[18px]"
        >
          <Icons.Prev className="w-[26px] h-[22px]" />
        </button>
        <h1 className="text-[25px] font-bold text-[#363e4a] leading-[30px] ml-4">
          회원가입
        </h1>
      </div>

      {/* 입력 필드 영역 */}
      <div className="flex-1 flex flex-col pt-[46px]">
        {/* 이름 입력 */}
        <div className="mb-[24px]">
          <div className="mb-[8px]">
            <span className="text-[14px] font-medium text-[#363e4a]">이름</span>
            <span className="text-[14px] font-medium text-[#ff3b30] ml-1">
              *
            </span>
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            onFocus={() => setIsNameFocused(true)}
            onBlur={() => setIsNameFocused(false)}
            placeholder="이름을 입력해주세요"
            className={`w-full h-[59px] border-[1.5px] rounded-[7px] px-5 text-[16px] font-medium outline-none transition-colors ${
              isNameFocused || name ? "border-[#3f55ff]" : "border-[#d2d2d2]"
            } placeholder:text-[#d2d2d2] placeholder:font-medium`}
          />
        </div>

        {/* 전화번호 입력 */}
        <div className="mb-[24px]">
          <div className="mb-[8px]">
            <span className="text-[14px] font-medium text-[#363e4a]">
              전화번호
            </span>
            <span className="text-[14px] font-medium text-[#ff3b30] ml-1">
              *
            </span>
          </div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            onFocus={() => setIsPhoneFocused(true)}
            onBlur={() => setIsPhoneFocused(false)}
            placeholder="전화번호를 입력해주세요"
            className={`w-full h-[59px] border-[1.5px] rounded-[7px] px-5 text-[16px] font-medium outline-none transition-colors ${
              isPhoneFocused || phone ? "border-[#3f55ff]" : "border-[#d2d2d2]"
            } placeholder:text-[#d2d2d2] placeholder:font-medium`}
          />
        </div>

        {/* 이메일 입력 */}
        <div className="mb-[25px]">
          <div className="mb-[8px]">
            <span className="text-[14px] font-medium text-[#363e4a]">
              이메일
            </span>
            <span className="text-[14px] font-medium text-[#ff3b30] ml-1">
              *
            </span>
          </div>
          <div className="flex items-center w-full max-w-full">
            <input
              type="text"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              onFocus={() => setIsEmailFocused(true)}
              onBlur={() => setIsEmailFocused(false)}
              placeholder={
                emailDomain === "직접입력"
                  ? "이메일을 입력해주세요"
                  : "이메일 아이디를 입력해주세요"
              }
              className={`flex-1 min-w-0 h-[59px] border-[1.5px] rounded-l-[7px] px-5 text-[16px] font-medium outline-none transition-colors ${
                isEmailFocused || email
                  ? "border-[#3f55ff]"
                  : "border-[#d2d2d2]"
              } placeholder:text-[#d2d2d2] placeholder:font-medium`}
            />
            <select
              value={emailDomain}
              onChange={(e) => handleEmailDomainChange(e.target.value)}
              className={`w-[130px] h-[59px] border-[1.5px] border-l-0 rounded-r-[7px] px-3 text-[16px] font-medium outline-none transition-colors bg-white appearance-none cursor-pointer ${
                isEmailFocused || email
                  ? "border-[#3f55ff]"
                  : "border-[#d2d2d2]"
              }`}
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: "right 8px center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "16px",
                color: emailDomain === "" ? "#D2D2D2" : "#363e4a",
              }}
            >
              <option value="" disabled>
                선택하기
              </option>
              <option value="gmail.com">gmail.com</option>
              <option value="naver.com">naver.com</option>
              <option value="hanmail.net">hanmail.net</option>
              <option value="kakao.com">kakao.com</option>
              <option value="daum.net">daum.net</option>
              <option value="직접입력">직접입력</option>
            </select>
          </div>
        </div>

        {/* 다음 버튼 */}
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
            {isLoading ? "발송중..." : "다음"}
          </span>
        </button>
      </div>
    </MainContainer>
  );
}
