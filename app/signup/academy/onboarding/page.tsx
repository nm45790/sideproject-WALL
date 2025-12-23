"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../../../utils/auth";
import { useSignupStore } from "../../../store/signupStore";
import Icons from "@/app/components/Icons";

interface OnboardingSlide {
  id: number;
  title: string;
  description: string;
  image: string;
}

const onboardingSlides: OnboardingSlide[] = [
  {
    id: 1,
    title: "휴대폰 하나로\n우리 아이들을 모두 관리!",
    description: "등원부터 상황 관리까지 간편하게 처리할 수 있어요!",
    image: "/images/onboarding-1.png",
  },
  {
    id: 2,
    title: "간편한 등원/하원 관리",
    description: "학부모와의 소통을 통해\n반려견의 일상을 안전하게 관리하세요",
    image: "/images/onboarding-2.png",
  },
  {
    id: 3,
    title: "체계적인 일정 관리",
    description: "수업, 급식, 산책 등\n모든 일정을 한눈에 확인하세요",
    image: "/images/onboarding-3.png",
  },
  {
    id: 4,
    title: "학부모와의 소통",
    description: "실시간 알림과 사진 공유로\n학부모와의 신뢰를 쌓아가세요",
    image: "/images/onboarding-4.png",
  },
];

export default function AcademyOnboardingPage() {
  const router = useRouter();
  const { updateAcademyOnboardingCompleted } = useSignupStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const userInfo = authService.getCurrentUserInfo();

  // 접근권한 체크
  useEffect(() => {
    if (!userInfo) {
      alert("잘못된 접근입니다.");
      router.push("/");
    }
  }, [router, userInfo]);

  const handleNext = () => {
    if (currentSlide < onboardingSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      // 마지막 슬라이드에서 다음 버튼 클릭 시 온보딩 완료 플래그 설정하고 info 페이지로 이동
      updateAcademyOnboardingCompleted(true);
      router.push("/signup/academy/info");
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleDotClick = (index: number) => {
    setCurrentSlide(index);
  };

  // 터치/마우스 이벤트 핸들러
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    // preventDefault 제거 - passive 이벤트 리스너에서 에러 발생 방지
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setIsDragging(false);

    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentSlide < onboardingSlides.length - 1) {
        // 왼쪽으로 스와이프 - 다음 슬라이드
        setCurrentSlide(currentSlide + 1);
      } else if (diff < 0 && currentSlide > 0) {
        // 오른쪽으로 스와이프 - 이전 슬라이드
        setCurrentSlide(currentSlide - 1);
      }
    }
  };

  // 마우스 이벤트 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    setStartX(e.clientX);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    // preventDefault 제거 - passive 이벤트 리스너에서 에러 발생 방지
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setIsDragging(false);

    const endX = e.clientX;
    const diff = startX - endX;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentSlide < onboardingSlides.length - 1) {
        // 왼쪽으로 스와이프 - 다음 슬라이드
        setCurrentSlide(currentSlide + 1);
      } else if (diff < 0 && currentSlide > 0) {
        // 오른쪽으로 스와이프 - 이전 슬라이드
        setCurrentSlide(currentSlide - 1);
      }
    }
  };

  const isLastSlide = currentSlide === onboardingSlides.length - 1;

  return (
    <div className="bg-white w-full h-screen overflow-hidden flex flex-col">
      {/* 헤더 영역 */}
      <div className="flex items-center justify-between px-5 pt-[45px] pb-5">
        <button onClick={handleBack} className="w-[26px] h-[22px]">
          <Icons.Prev className="w-[26px] h-[22px]" />
        </button>

        {/* 페이지 인디케이터 - 상단 중앙 */}
        <div className="flex gap-2">
          {onboardingSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-[#3f55ff] w-6"
                  : "bg-[#e5e5e5] hover:bg-[#d0d0d0]"
              }`}
            />
          ))}
        </div>

        {/* 빈 공간 (균형 맞추기) */}
        <div className="w-[26px]"></div>
      </div>

      {/* 스와이프 가능한 컨테이너 */}
      <div
        className="flex-1 flex transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {onboardingSlides.map((slide, index) => (
          <div
            key={slide.id}
            className="w-full h-full flex-shrink-0 flex flex-col"
          >
            {/* 이미지 영역 */}
            <div className="flex-1 flex items-center justify-center px-5">
              <div className="w-full max-w-[300px] h-[300px] flex items-center justify-center">
                <div className="w-full h-full bg-gray-100 rounded-[20px] flex items-center justify-center">
                  {/* TODO: 실제 이미지가 있으면 여기에 표시 */}
                  <div className="text-[#858585] text-[16px] text-center">
                    {slide.image}
                  </div>
                </div>
              </div>
            </div>

            {/* 텍스트 영역 */}
            <div className="px-7 pb-8 text-center">
              <h1
                className="font-bold text-gray-900 text-[25px] leading-[30px] mb-4"
                style={{ whiteSpace: "pre-line" }}
              >
                {slide.title}
              </h1>
              <p className="font-medium text-[#858585] text-[16px] leading-[24px]">
                {slide.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 다음 버튼 */}
      <div className="px-5 pb-8">
        <button
          onClick={handleNext}
          className="w-full h-[59px] bg-[#3f55ff] rounded-[7px] flex items-center justify-center"
        >
          <p className="font-semibold text-white text-[16px]">
            {isLastSlide ? "시작하기" : "다음"}
          </p>
        </button>
      </div>
    </div>
  );
}
