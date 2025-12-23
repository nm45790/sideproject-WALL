"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { authService } from "../utils/auth";
import { api } from "../utils/api";
import { Pet, PetsResponse } from "../types/pet";
import PetCard from "../components/PetCard";
import WaitingCard from "../components/WaitingCard";
import RejectedCard from "../components/RejectedCard";
import AddPetCard from "../components/AddPetCard";
import MainContainer from "../components/MainContainer";

export default function ParentPage() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // 사용자 정보 및 반려동물 목록 조회
  useEffect(() => {
    const userInfo = authService.getCurrentUserInfo();
    if (!userInfo) {
      alert("로그인이 필요합니다.");
      router.push("/");
      return;
    }

    setUserName(userInfo.name);

    // 반려동물 목록 조회
    const fetchPets = async () => {
      try {
        const response = await api.get<PetsResponse>("/api/v1/pets");
        if (response.success && response.data) {
          setPets(response.data.data);
        }
      } catch (error) {
        console.error("반려동물 목록 조회 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPets();
  }, [router]);

  // 스크롤 이벤트 처리
  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const cardWidth = 315 + 30; // 카드 너비 + 간격
      const index = Math.round(scrollLeft / cardWidth);
      setCurrentIndex(index);
    }
  };

  // 마우스 드래그 시작
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
    scrollRef.current.style.cursor = "grabbing";
    scrollRef.current.style.userSelect = "none";
  };

  // 마우스 드래그 종료
  const handleMouseUp = () => {
    if (!scrollRef.current) return;
    setIsDragging(false);
    scrollRef.current.style.cursor = "grab";
    scrollRef.current.style.userSelect = "auto";
  };

  // 마우스 드래그 이동
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // 스크롤 속도 조절
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  // 마우스가 영역을 벗어났을 때
  const handleMouseLeave = () => {
    if (!scrollRef.current) return;
    setIsDragging(false);
    scrollRef.current.style.cursor = "grab";
    scrollRef.current.style.userSelect = "auto";
  };

  // 설정 페이지로 이동
  const handleSettings = () => {
    router.push("/parent/setting");
  };

  if (isLoading) {
    return (
      <MainContainer bg="#f3f4f9">
        <div className="flex items-center justify-center py-[60px]">
          <p className="text-[16px] text-[#858585]">로딩 중...</p>
        </div>
      </MainContainer>
    );
  }

  const totalCards = pets.length + 1; // 반려동물 + 추가 카드

  return (
    <MainContainer bg="#f3f4f9" noPadding>
      {/* 상단 헤더 */}
      <div className="bg-[#f3f4f9] min-h-[144px] relative px-[20px] mb-[20px] pb-[20px]">
        <div className="pt-[73px]">
          <p className="text-[20px] font-bold text-gray-900 leading-[24px]">
            안녕하세요!
          </p>
          <div className="flex items-start gap-[4px] mt-[5px] flex-wrap">
            <div className="bg-[#3f59ff] rounded-[7px] px-[8px] py-[5px]">
              <p className="text-[20px] font-bold text-white leading-[24px]">
                {pets.length > 0
                  ? pets.map((pet) => pet.petName).join(", ")
                  : userName}
              </p>
            </div>
            <p className="text-[20px] font-bold text-gray-900 leading-[24px]">
              보호자님! 👋
            </p>
          </div>
        </div>

        {/* 설정 아이콘 */}
        <button
          onClick={handleSettings}
          className="absolute right-[20px] top-[73px] w-[24px] h-[24px]"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
              stroke="#858585"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.0113 9.77251C4.28059 9.5799 4.48572 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15Z"
              stroke="#858585"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* 카드 스와이프 영역 */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="flex gap-[30px] px-[30px] overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth cursor-grab"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {pets.map((pet) => {
          // enrollmentStatus에 따라 다른 카드 렌더링
          if (pet.enrollmentStatus === "WAITING") {
            return <WaitingCard key={pet.id} />;
          } else if (pet.enrollmentStatus === "CANCELLED") {
            return <RejectedCard key={pet.id} />;
          } else if (pet.enrollmentStatus === "APPROVED") {
            return <PetCard key={pet.id} pet={pet} />;
          }
          return null;
        })}
        {/* + 추가 버튼 카드 */}
        <AddPetCard />
      </div>

      {/* 하단 인디케이터 */}
      <div className="flex items-center justify-center gap-[8px] mt-[30px] pb-[40px]">
        {Array.from({ length: totalCards }).map((_, index) => (
          <div
            key={index}
            className={`h-[10px] rounded-full transition-all ${
              index === currentIndex
                ? "w-[36px] bg-[#3f59ff]"
                : "w-[10px] bg-[#d2d2d2]"
            }`}
          />
        ))}
      </div>

      {/* 스크롤바 숨기기 스타일 */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </MainContainer>
  );
}
