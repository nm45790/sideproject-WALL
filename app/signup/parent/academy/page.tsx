"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MainContainer from "../../../components/MainContainer";
import Icons from "../../../components/Icons";
import { useSignupStore } from "../../../store/signupStore";
import AcademySelectorModal from "../../../components/AcademySelectorModal";
import RegionSelectorModal from "../../../components/RegionSelectorModal";
import { api } from "../../../utils/api";

interface Academy {
  id: number;
  name: string;
  address: string;
  addressDetail: string;
  sggCode: string;
  phone: string;
  description: string | null;
  status: string;
}

export default function ParentAcademyPage() {
  const router = useRouter();
  const {
    signupData,
    updatePetAcademyId,
    updateRegionCode,
    isParentOnboardingCompleted,
  } = useSignupStore();

  const [isAcademyModalOpen, setIsAcademyModalOpen] = useState(false);
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [regionName, setRegionName] = useState("전국");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAcademyName, setSelectedAcademyName] = useState("");
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 지역 코드를 sggCode로 변환
  const getSggCodeFromRegion = (regionCode: string): string | null => {
    const regionToSggCode: Record<string, string> = {
      SEOUL: "11",
      BUSAN: "26",
      DAEGU: "27",
      INCHEON: "28",
      GWANGJU: "29",
      DAEJEON: "30",
      ULSAN: "31",
      SEJONG: "36",
      GYEONGGI: "41",
      CHUNGBUK: "43",
      CHUNGNAM: "44",
      JEONBUK: "45",
      JEONNAM: "46",
      GYEONGBUK: "47",
      GYEONGNAM: "48",
      JEJU: "50",
      GANGWON: "51",
    };
    return regionToSggCode[regionCode] || null;
  };

  // 선택된 유치원 이름 표시용
  const selectedAcademy =
    signupData.petAcademyId !== 0 && selectedAcademyName
      ? { id: signupData.petAcademyId, name: selectedAcademyName }
      : null;

  // 접근권한 체크
  useEffect(() => {
    // 강아지 추가 모드면 온보딩 체크 건너뜀
    if (signupData.isAddingPet) {
      return;
    }

    // 온보딩 완료 여부 체크
    if (!isParentOnboardingCompleted()) {
      alert("잘못된 접근입니다.");
      router.push("/");
    }
  }, [router, isParentOnboardingCompleted, signupData.isAddingPet]);

  // 페이지 로드 시 및 지역 변경 시 유치원 목록 조회
  useEffect(() => {
    const fetchAcademies = async () => {
      setIsLoading(true);
      try {
        // sggCode 파라미터 생성
        const sggCode = getSggCodeFromRegion(signupData.regionCode);
        let url = `/api/v1/academies/search`;
        if (sggCode) {
          url += `?sggCode=${sggCode}`;
        }

        const response = await api.get<{
          code: number;
          data: Academy[];
        }>(url);

        if (response.success && response.data) {
          setAcademies(response.data.data || []);
        } else {
          setAcademies([]);
        }
      } catch (error) {
        console.error("유치원 목록 조회 실패:", error);
        setAcademies([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAcademies();
  }, [signupData.regionCode]);

  const handleAcademySelect = (academyId: number, academyName?: string) => {
    updatePetAcademyId(academyId);
    if (academyName) {
      setSelectedAcademyName(academyName);
    }
  };

  const handleRegionSelect = (regionCode: string, name: string) => {
    updateRegionCode(regionCode);
    setRegionName(name);
  };

  const handleNext = async () => {
    if (signupData.petAcademyId === 0) {
      alert("유치원을 선택해주세요");
      return;
    }

    setIsSubmitting(true);

    try {
      // 반려동물 등록 데이터
      const petData: any = {
        name: signupData.petName,
        breed: signupData.petBreed,
        birthday: signupData.petBirthday,
        gender: signupData.petGender,
        academyId: signupData.petAcademyId,
        imageKey: signupData.petImageKey,
        // 추후 필요한 값 현재는 임시값
        startDate: new Date().toISOString().slice(0, 10).replace(/-/g, ""),
        endDate: new Date().toISOString().slice(0, 10).replace(/-/g, ""),
      };

      console.log("반려동물 등록 데이터:", petData);

      // API 엔드포인트 분기
      const apiEndpoint = signupData.isAddingPet
        ? "/api/v1/pets" // 강아지 추가
        : "/api/v1/members/signup/parent"; // 새 회원 등록

      console.log(
        `API 호출: ${apiEndpoint} (모드: ${signupData.isAddingPet ? "강아지 추가" : "새 회원 등록"})`,
      );

      const response = await api.post(apiEndpoint, petData);

      if (response.success) {
        console.log("등록 성공:", response.data);

        // 성공 시 이동할 페이지 결정
        if (signupData.isAddingPet) {
          // 강아지 추가 모드: 보호자 메인 페이지로 이동
          router.push("/parent");
        } else {
          // 새 회원 등록 모드: complete 페이지로 이동
          router.push("/signup/parent/complete");
        }
      } else {
        throw new Error(response.error || "등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("등록 실패:", error);
      alert("등록에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <MainContainer>
      {/* 헤더 영역 - 뒤로가기 */}
      <div className="flex items-center pt-[45px] pb-[20px]">
        <button
          onClick={handleGoBack}
          className="p-[18px] w-[57px] h-[57px] flex items-center justify-center -ml-[18px]"
        >
          <Icons.Prev className="w-[26px] h-[22px]" />
        </button>
      </div>

      {/* 입력 필드 영역 */}
      <div className="flex-1 flex flex-col pt-[38px]">
        {/* 제목 */}
        <div className="mb-[39px]">
          <h2 className="text-[25px] font-bold text-gray-900 leading-[30px] mb-[8px]">
            유치원을 등록해주세요!
          </h2>
          <p className="text-[16px] font-medium text-[#858585] leading-[20px]">
            우리 아이가 다니는 유치원을 등록해주세요
          </p>
        </div>

        {/* 유치원 입력 */}
        <div className="mb-[25px]">
          <button
            onClick={() => setIsAcademyModalOpen(true)}
            className="w-full h-[59px] border-[1.5px] border-[#d2d2d2] rounded-[7px] px-5 flex items-center justify-between"
          >
            <span
              className={`text-[16px] font-medium ${
                selectedAcademy ? "text-gray-900" : "text-[#b4b4b4]"
              }`}
            >
              {selectedAcademy ? selectedAcademy.name : "유치원을 입력해주세요"}
            </span>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z"
                stroke="#b4b4b4"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* 다음 버튼 */}
        <button
          onClick={handleNext}
          disabled={signupData.petAcademyId === 0 || isSubmitting}
          className={`w-full h-[59px] rounded-[7px] flex items-center justify-center transition-colors ${
            signupData.petAcademyId !== 0 && !isSubmitting
              ? "bg-[#3f55ff] cursor-pointer"
              : "bg-[#f0f0f0] cursor-not-allowed"
          }`}
        >
          <span className="font-semibold text-[16px] text-white">
            {isSubmitting ? "등록 중..." : "다음"}
          </span>
        </button>
      </div>

      {/* 유치원 선택 모달 */}
      <AcademySelectorModal
        isOpen={isAcademyModalOpen}
        onClose={() => setIsAcademyModalOpen(false)}
        selectedAcademyId={signupData.petAcademyId}
        onAcademySelect={handleAcademySelect}
        regionCode={signupData.regionCode}
        regionName={regionName}
        onRegionClick={() => setIsRegionModalOpen(true)}
        academies={academies}
        isLoading={isLoading}
      />

      {/* 지역 선택 모달 */}
      <RegionSelectorModal
        isOpen={isRegionModalOpen}
        onClose={() => setIsRegionModalOpen(false)}
        selectedRegion={signupData.regionCode}
        onRegionSelect={handleRegionSelect}
      />
    </MainContainer>
  );
}
