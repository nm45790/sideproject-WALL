"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import MainContainer from "../../components/MainContainer";
import Icons from "../../components/Icons";
import { useAuth } from "../../components/CombinedProvider";
import { api } from "../../utils/api";
import { uploadFile } from "../../utils/upload";
import { authService } from "../../utils/auth";

interface Schedule {
  id?: number;
  dayOfWeek: string;
  isOpen: boolean;
  operatingStartTime: string;
  operatingEndTime: string;
}

interface AcademyDetail {
  id: number;
  name: string;
  address: string;
  addressDetail: string;
  sggCode: string;
  phone: string;
  description: string;
  status: string;
  academyImage: string | null;
  maxCapacity: number;
  adminId: string;
  adminName: string;
  schedules: Schedule[];
}

const DAYS_OF_WEEK = [
  { key: "SUN", label: "일", color: "text-[#f56868]" },
  { key: "MON", label: "월", color: "text-[#8e8e8e]" },
  { key: "TUE", label: "화", color: "text-[#8e8e8e]" },
  { key: "WED", label: "수", color: "text-[#8e8e8e]" },
  { key: "THU", label: "목", color: "text-[#8e8e8e]" },
  { key: "FRI", label: "금", color: "text-[#8e8e8e]" },
  { key: "SAT", label: "토", color: "text-[#8e8e8e]" },
];

export default function AcademySettingPage() {
  const router = useRouter();
  const userInfo = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [academyData, setAcademyData] = useState<AcademyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 이미지 관련 state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // 유치원 정보 조회
  const fetchAcademyData = async () => {
    if (!userInfo?.academyId) return;

    try {
      setIsLoading(true);
      const response = await api.get(`/api/v1/academies/${userInfo.academyId}`);

      console.log("🏫 유치원 정보 API 응답:", response);

      if (response.success && response.data && (response.data as any).data) {
        const data = (response.data as any).data as AcademyDetail;
        console.log("🏫 파싱된 유치원 정보:", data);
        setAcademyData(data);

        // 기존 이미지 설정
        if (data.academyImage) {
          setPreviewUrl(data.academyImage);
        }
      }
    } catch (error) {
      console.error("유치원 정보 조회 실패:", error);
      alert("유치원 정보를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo?.academyId) {
      fetchAcademyData();
    }
  }, [userInfo?.academyId]);

  // 이미지 선택
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 저장하기
  const handleSave = async () => {
    if (!academyData || !userInfo?.academyId) return;

    setIsSaving(true);

    try {
      let academyImage = academyData.academyImage;

      // 새 이미지 업로드
      if (selectedFile) {
        academyImage = await uploadFile(selectedFile);
        console.log("✅ 이미지 업로드 성공:", academyImage);
      }

      // PATCH 요청
      const updateData = {
        name: academyData.name,
        address: academyData.address,
        addressDetail: academyData.addressDetail,
        phone: academyData.phone,
        description: academyData.description,
        academyImage,
        maxCapacity: academyData.maxCapacity,
        schedules: academyData.schedules,
      };

      console.log("💾 저장 데이터:", updateData);

      const response = await api.patch(
        `/api/v1/academies/${userInfo.academyId}`,
        updateData,
      );

      if (response.success) {
        alert("저장되었습니다.");
        // 데이터 새로고침
        await fetchAcademyData();
      } else {
        throw new Error("저장에 실패했습니다.");
      }
    } catch (error) {
      console.error("저장 실패:", error);
      alert("저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSaving(false);
    }
  };

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

  if (isLoading || !academyData) {
    return (
      <MainContainer bg="#ffffff" noPadding>
        <div className="w-full min-h-dvh flex items-center justify-center">
          <p className="text-[#858585] text-[14px]">로딩 중...</p>
        </div>
      </MainContainer>
    );
  }

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

        {/* 헤더 - 아이콘 + 제목 */}
        <div className="bg-white px-[20px] pb-[14px]">
          <div className="flex items-center gap-[12px] mb-[8px]">
            <div className="w-[52px] h-[52px] bg-gradient-to-br from-[#ff8a9e] to-[#ff5d7a] rounded-[10px] flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path
                  d="M14 2L17 11L26 14L17 17L14 26L11 17L2 14L11 11L14 2Z"
                  fill="white"
                />
              </svg>
            </div>
          </div>
          <p className="font-bold text-gray-900 text-[20px] leading-[normal] mb-[6px]">
            유치원 설정
          </p>
          <p className="font-medium text-[#6e7783] text-[12px] leading-[normal]">
            유치원 정보를 한곳에서 빠르게 수정하세요.
          </p>
        </div>

        {/* 구분선 */}
        <div className="w-full h-[1px] bg-[#d2d6db]" />

        {/* 컨텐츠 */}
        <div className="px-[20px] pt-[20px]">
          {/* 유치원 이미지 */}
          <div className="mb-[20px] flex justify-center">
            <div className="relative">
              <button
                onClick={handleUploadClick}
                className={`w-[261px] h-[261px] rounded-[10px] border-2 border-dashed flex flex-col items-center justify-center transition-colors relative ${
                  previewUrl
                    ? "border-[#3f55ff] bg-[#f8f9ff]"
                    : "border-[#d2d2d2] bg-[#f0f0f0] hover:border-[#3f55ff] hover:bg-[#f8f9ff]"
                }`}
              >
                {previewUrl ? (
                  <>
                    <img
                      src={previewUrl}
                      alt="유치원 이미지"
                      className="w-full h-full object-cover rounded-[8px]"
                    />
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage();
                      }}
                      className="absolute top-2 right-2 w-6 h-6 bg-black bg-opacity-50 rounded-full flex items-center justify-center hover:bg-opacity-70 transition-colors cursor-pointer"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                      >
                        <path
                          d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-[24px] h-[22px] mb-[8px]">
                      <svg
                        width="24"
                        height="22"
                        viewBox="0 0 24 22"
                        fill="none"
                      >
                        <path
                          d="M12 15.5C14.4853 15.5 16.5 13.4853 16.5 11C16.5 8.51472 14.4853 6.5 12 6.5C9.51472 6.5 7.5 8.51472 7.5 11C7.5 13.4853 9.51472 15.5 12 15.5Z"
                          stroke="#8e8e8e"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M21 19H3C2.45 19 2 18.55 2 18V6C2 5.45 2.45 5 3 5H7L9 3H15L17 5H21C21.55 5 22 5.45 22 6V18C22 18.55 21.55 19 21 19Z"
                          stroke="#8e8e8e"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <p className="text-[14px] font-medium text-[#8e8e8e]">
                      사진을 선택해주세요
                    </p>
                  </>
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* 정원 */}
          <div className="mb-[20px]">
            <p className="font-semibold text-gray-900 text-[18px] leading-[normal] mb-[31px]">
              정원
            </p>
            <div className="bg-white rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] h-[57px] flex items-center px-[20px]">
              <input
                type="number"
                value={academyData.maxCapacity}
                onChange={(e) =>
                  setAcademyData({
                    ...academyData,
                    maxCapacity: parseInt(e.target.value) || 0,
                  })
                }
                className="font-semibold text-[#6e7783] text-[14px] w-full outline-none"
                placeholder="정원을 입력하세요"
              />
              <span className="font-semibold text-[#6e7783] text-[14px]">
                마리
              </span>
            </div>
          </div>

          {/* 운영 정보 */}
          <div className="mb-[20px]">
            <p className="font-semibold text-gray-900 text-[18px] leading-[normal] mb-[31px]">
              운영 정보
            </p>
            <div className="bg-white rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] px-[21px] py-[20px]">
              {DAYS_OF_WEEK.map((day, index) => {
                const schedule = academyData.schedules.find(
                  (s) => s.dayOfWeek === day.key,
                );
                const isOpen = schedule?.isOpen ?? false;

                return (
                  <div
                    key={day.key}
                    className={`flex items-center ${index < DAYS_OF_WEEK.length - 1 ? "mb-[37px]" : ""}`}
                  >
                    <p
                      className={`font-semibold ${day.color} text-[14px] leading-[normal] w-[20px]`}
                    >
                      {day.label}
                    </p>
                    <div className="ml-[27px] flex items-center gap-[8px]">
                      {isOpen ? (
                        <>
                          <input
                            type="time"
                            value={schedule?.operatingStartTime || "09:00"}
                            onChange={(e) => {
                              const newSchedules = academyData.schedules.map(
                                (s) =>
                                  s.dayOfWeek === day.key
                                    ? {
                                        ...s,
                                        operatingStartTime: e.target.value,
                                      }
                                    : s,
                              );
                              setAcademyData({
                                ...academyData,
                                schedules: newSchedules,
                              });
                            }}
                            className="font-semibold text-[#6e7783] text-[14px] outline-none"
                          />
                          <span className="font-semibold text-[#6e7783] text-[14px]">
                            ~
                          </span>
                          <input
                            type="time"
                            value={schedule?.operatingEndTime || "18:00"}
                            onChange={(e) => {
                              const newSchedules = academyData.schedules.map(
                                (s) =>
                                  s.dayOfWeek === day.key
                                    ? { ...s, operatingEndTime: e.target.value }
                                    : s,
                              );
                              setAcademyData({
                                ...academyData,
                                schedules: newSchedules,
                              });
                            }}
                            className="font-semibold text-[#6e7783] text-[14px] outline-none"
                          />
                        </>
                      ) : (
                        <p className="font-semibold text-[#d2d2d2] text-[14px]">
                          휴무
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 상호명 */}
          <div className="mb-[20px]">
            <p className="font-semibold text-gray-900 text-[18px] leading-[normal] mb-[31px]">
              상호명
            </p>
            <div className="bg-white rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] h-[57px] flex items-center px-[20px]">
              <input
                type="text"
                value={academyData.name}
                onChange={(e) =>
                  setAcademyData({ ...academyData, name: e.target.value })
                }
                className="font-semibold text-[#6e7783] text-[14px] w-full outline-none"
                placeholder="상호명을 입력하세요"
              />
            </div>
          </div>

          {/* 대표번호 */}
          <div className="mb-[20px]">
            <p className="font-semibold text-gray-900 text-[18px] leading-[normal] mb-[31px]">
              대표번호
            </p>
            <div className="bg-white rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] h-[57px] flex items-center px-[20px]">
              <input
                type="tel"
                value={academyData.phone}
                onChange={(e) =>
                  setAcademyData({ ...academyData, phone: e.target.value })
                }
                className="font-semibold text-[#6e7783] text-[14px] w-full outline-none"
                placeholder="대표번호를 입력하세요"
              />
            </div>
          </div>

          {/* 주소 */}
          <div className="mb-[40px]">
            <p className="font-semibold text-gray-900 text-[18px] leading-[normal] mb-[31px]">
              주소
            </p>
            <div className="bg-white rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] px-[20px] py-[20px]">
              <input
                type="text"
                value={academyData.address}
                onChange={(e) =>
                  setAcademyData({ ...academyData, address: e.target.value })
                }
                className="font-semibold text-[#6e7783] text-[14px] w-full outline-none mb-[10px]"
                placeholder="주소"
              />
              <input
                type="text"
                value={academyData.addressDetail}
                onChange={(e) =>
                  setAcademyData({
                    ...academyData,
                    addressDetail: e.target.value,
                  })
                }
                className="font-semibold text-[#6e7783] text-[14px] w-full outline-none"
                placeholder="상세주소"
              />
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
          onClick={handleSave}
          disabled={isSaving}
          className={`w-full h-[59px] rounded-[7px] flex items-center justify-center transition-colors ${
            isSaving
              ? "bg-[#f0f0f0] cursor-not-allowed"
              : "bg-[#3f55ff] hover:bg-[#3646e6] cursor-pointer"
          }`}
        >
          <span className="font-semibold text-white text-[16px]">
            {isSaving ? "저장 중..." : "저장하기"}
          </span>
        </button>
      </div>
    </MainContainer>
  );
}
