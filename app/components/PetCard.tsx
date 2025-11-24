"use client";

import { useRouter } from "next/navigation";
import { Pet } from "../types/pet";
import Icons from "./Icons";
import { getImageUrl } from "../utils/image";

interface PetCardProps {
  pet: Pet;
}

// 생일로부터 함께한 기간 계산
function calculateTimeWithPet(birthday: string): string {
  const year = parseInt(birthday.substring(0, 4));
  const month = parseInt(birthday.substring(4, 6)) - 1;
  const day = parseInt(birthday.substring(6, 8));

  const birthDate = new Date(year, month, day);
  const today = new Date();

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  // 일수가 음수면 이전 달에서 빌려옴
  if (days < 0) {
    months--;
    const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += lastMonth.getDate();
  }

  // 월수가 음수면 이전 년도에서 빌려옴
  if (months < 0) {
    years--;
    months += 12;
  }

  return `${years}년 ${months}개월`;
}

export default function PetCard({ pet }: PetCardProps) {
  const router = useRouter();
  const timeWithPet = calculateTimeWithPet(pet.petBirthday);
  const imageUrl = getImageUrl(pet.petImage);

  const handleCardClick = () => {
    // 상태 페이지로 이동 (petId와 academyId 전달)
    router.push(`/parent/status?petId=${pet.id}&academyId=${pet.academyId}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
    router.push(`/parent/update?petId=${pet.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-[7px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] w-[315px] min-h-[458px] flex-shrink-0 snap-center relative pb-[20px] cursor-pointer hover:shadow-lg transition-shadow"
    >
      {/* 수정 버튼 */}
      <button
        onClick={handleEdit}
        className="absolute right-[20px] top-[20px] w-[24px] h-[24px] z-10 hover:opacity-70 transition-opacity"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
            stroke="#363e4a"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z"
            stroke="#363e4a"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* 유치원명 */}
      <div className="flex items-center gap-[4px] pt-[20px] px-[20px]">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
            stroke="#3f59ff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8 10.5V8"
            stroke="#3f59ff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="8" cy="5.5" r="0.5" fill="#3f59ff" />
        </svg>
        <p className="text-[16px] font-bold text-[#3f59ff]">
          {pet.academyName}
        </p>
      </div>

      {/* 반려동물 이름과 견종 */}
      <div className="px-[20px] mt-[19px] mb-[11px]">
        <div className="flex items-center gap-[6px] mb-[6px]">
          <p className="text-[18px] font-bold text-[#363e4a]">{pet.petName}</p>
          <span className="text-[18px]">
            {pet.petGender === "MALE" ? "♂" : "♀"}
          </span>
        </div>
        <p className="text-[12px] font-medium text-[#858585]">{pet.petBreed}</p>
      </div>

      {/* 반려동물 사진 */}
      <div className="px-[20px] mb-[20px]">
        <div className="w-[275px] h-[275px] rounded-[7px] bg-[#f0f0f0] overflow-hidden relative">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={pet.petName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                width="60"
                height="60"
                viewBox="0 0 60 60"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M30 37.5C35.5228 37.5 40 33.0228 40 27.5C40 21.9772 35.5228 17.5 30 17.5C24.4772 17.5 20 21.9772 20 27.5C20 33.0228 24.4772 37.5 30 37.5Z"
                  stroke="#c2c2c2"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M52.5 47.5H7.5C6.125 47.5 5 46.375 5 45V15C5 13.625 6.125 12.5 7.5 12.5H17.5L22.5 7.5H37.5L42.5 12.5H52.5C53.875 12.5 55 13.625 55 15V45C55 46.375 53.875 47.5 52.5 47.5Z"
                  stroke="#c2c2c2"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* 함께한 기간 */}
      <div className="px-[20px]">
        <div className="bg-[#efefef] rounded-[7px] p-[10px] flex items-center gap-[8px] relative">
          <span className="text-[16px] font-bold absolute -top-[8px] left-[8px]">
            🐶
          </span>
          <p className="text-[14px] font-semibold text-[#363e4a] pl-[20px]">
            우리 아이랑 함께한 지 {timeWithPet}
          </p>
        </div>
      </div>
    </div>
  );
}
