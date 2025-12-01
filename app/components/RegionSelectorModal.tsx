"use client";

import { useState, useEffect } from "react";

interface RegionSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRegion: string;
  onRegionSelect: (regionCode: string, regionName: string) => void;
}

export default function RegionSelectorModal({
  isOpen,
  onClose,
  selectedRegion,
  onRegionSelect,
}: RegionSelectorModalProps) {
  // 지역 데이터 (regionCode, regionName)
  const regions = [
    { code: "ALL", name: "전국" },
    { code: "SEOUL", name: "서울" },
    { code: "GYEONGGI", name: "경기" },
    { code: "INCHEON", name: "인천" },
    { code: "BUSAN", name: "부산" },
    { code: "DAEGU", name: "대구" },
    { code: "GWANGJU", name: "광주" },
    { code: "DAEJEON", name: "대전" },
    { code: "ULSAN", name: "울산" },
    { code: "SEJONG", name: "세종" },
    { code: "GANGWON", name: "강원" },
    { code: "CHUNGBUK", name: "충북" },
    { code: "CHUNGNAM", name: "충남" },
    { code: "JEONBUK", name: "전북" },
    { code: "JEONNAM", name: "전남" },
    { code: "GYEONGBUK", name: "경북" },
    { code: "GYEONGNAM", name: "경남" },
    { code: "JEJU", name: "제주" },
  ];

  // 내부에서 선택된 지역 관리 (UI 반영용)
  const [tempSelectedRegion, setTempSelectedRegion] = useState(selectedRegion);

  // 모달이 열릴 때 선택된 지역으로 초기화
  useEffect(() => {
    if (isOpen) {
      setTempSelectedRegion(selectedRegion);
    }
  }, [isOpen, selectedRegion]);

  const handleRegionClick = (code: string) => {
    // 선택만 업데이트 (모달은 닫지 않음)
    setTempSelectedRegion(code);
  };

  const handleComplete = () => {
    // 선택된 지역 찾기
    const selectedRegionData = regions.find(
      (r) => r.code === tempSelectedRegion,
    );
    if (selectedRegionData) {
      onRegionSelect(selectedRegionData.code, selectedRegionData.name);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#000000]/70 flex items-end"
      onClick={onClose}
    >
      <div
        className="bg-white w-full rounded-t-[15px] max-h-[70vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="bg-white pt-[32px] pb-[20px] px-5 border-b border-[#f0f0f0] flex items-center justify-between flex-shrink-0">
          <p className="text-[18px] font-bold text-[#363e4a]">지역</p>
          <button
            onClick={onClose}
            className="w-[24px] h-[24px] flex items-center justify-center"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="#363e4a"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* 지역 그리드 - 스크롤 가능 영역 */}
        <div className="overflow-y-auto flex-1">
          <div className="grid grid-cols-4 gap-[10px] p-5">
            {regions.map((region) => (
              <button
                key={region.code}
                onClick={() => handleRegionClick(region.code)}
                className={`h-[48px] rounded-[5px] flex items-center justify-center text-[14px] font-semibold transition-colors ${
                  tempSelectedRegion === region.code
                    ? "bg-[#ECEFFF] text-[#3F55FF]"
                    : "bg-[#F5F5F5] text-[#BBBBBB] hover:bg-[#e8e8e8]"
                }`}
              >
                {region.name}
              </button>
            ))}
          </div>
        </div>

        {/* 선택 완료 버튼 */}
        <div className="px-5 py-[20px] flex-shrink-0">
          <button
            onClick={handleComplete}
            className="w-full h-[59px] bg-[#3f55ff] rounded-[7px] flex items-center justify-center"
          >
            <span className="font-semibold text-[16px] text-white">
              필터 선택 완료
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
