"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import MainContainer from "../../../components/MainContainer";
import Icons from "../../../components/Icons";
import { useSignupStore } from "../../../store/signupStore";
import { authService } from "../../../utils/auth";
import { uploadFile } from "../../../utils/upload";
import { apiClient } from "../../../utils/api";

export default function AcademyPicturePage() {
  const router = useRouter();
  const { signupData, updateImageKey, isAcademyOnboardingCompleted } =
    useSignupStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const userInfo = authService.getCurrentUserInfo();

  // 접근권한 체크
  useEffect(() => {
    if (!userInfo) {
      alert("잘못된 접근입니다.");
      router.push("/");
      return;
    }

    // 온보딩 완료 여부 체크
    if (!isAcademyOnboardingCompleted()) {
      alert("잘못된 접근입니다.");
      router.push("/");
    }
  }, [router, userInfo, isAcademyOnboardingCompleted]);

  const handleGoBack = () => {
    router.back();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // 미리보기 URL 생성
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    // 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleNext = async () => {
    if (!selectedFile) {
      alert("사진을 선택해주세요.");
      return;
    }

    setIsUploading(true);

    try {
      // 1. 이미지 업로드
      const s3Key = await uploadFile(selectedFile);
      updateImageKey(s3Key);
      console.log("Upload successful, s3Key:", s3Key);

      // 2. 회원가입 API 호출
      const academySignupData = {
        academyName: signupData.academyName,
        academyAddress: signupData.academyAddress,
        academyAddressDetail: signupData.academyAddressDetail,
        sggCode: signupData.sggCode,
        academyPhone: signupData.academyPhone,
        maxCapacity: signupData.maxCapacity,
        scheduleList: signupData.scheduleList,
      };

      console.log("회원가입 API 호출:", academySignupData);

      const response = await apiClient.post(
        "/api/v1/members/signup/academy",
        academySignupData,
        {
          requireAuth: true,
        },
      );

      if (response.success) {
        console.log("회원가입 성공:", response);
        // 3. 성공 시 완료 페이지로 이동
        router.push("/signup/academy/complete");
      } else {
        throw new Error("회원가입에 실패했습니다.");
      }
    } catch (error) {
      console.error("회원가입 실패:", error);
      alert("회원가입에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsUploading(false);
    }
  };

  const isFormValid = selectedFile !== null;

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
      </div>

      {/* 입력 필드 영역 */}
      <div className="flex-1 flex flex-col pt-[38px]">
        {/* 제목 */}
        <div className="mb-[8px]">
          <h2 className="text-[25px] font-bold text-gray-900 leading-[30px] mb-[8px]">
            유치원의 사진을 등록해주세요!
          </h2>
          <p className="text-[16px] font-medium text-[#858585] leading-[20px]">
            사진 한 장이면 보호자에게 신뢰감을 줄 수 있어요
            <br />
            내부 공간, 간판, 귀여운 친구들 사진도 좋아요
          </p>
        </div>

        {/* 사진 업로드 영역 */}
        <div className="mb-[25px] mt-[53px] flex justify-center">
          <div className="relative">
            {/* 업로드 버튼 */}
            <button
              onClick={handleUploadClick}
              className={`w-[261px] h-[261px] rounded-[10px] border-2 border-dashed flex flex-col items-center justify-center transition-colors relative ${
                selectedFile
                  ? "border-[#3f55ff] bg-[#f8f9ff]"
                  : "border-[#d2d2d2] bg-[#f0f0f0] hover:border-[#3f55ff] hover:bg-[#f8f9ff]"
              }`}
            >
              {previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    alt="미리보기"
                    className="w-full h-full object-cover rounded-[8px]"
                  />
                  {/* 제거 버튼 */}
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
                      xmlns="http://www.w3.org/2000/svg"
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
                  {/* 카메라 아이콘 */}
                  <div className="w-[24px] h-[22px] mb-[8px]">
                    <svg
                      width="24"
                      height="22"
                      viewBox="0 0 24 22"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
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

            {/* 숨겨진 파일 입력 */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>

        {/* 다음 버튼 */}
        <button
          onClick={handleNext}
          disabled={!isFormValid || isUploading}
          className={`w-full h-[59px] rounded-[7px] flex items-center justify-center transition-colors ${
            isFormValid && !isUploading
              ? "bg-[#3f55ff] hover:bg-[#3646e6] cursor-pointer"
              : "bg-[#f0f0f0] cursor-not-allowed"
          }`}
        >
          <span className="font-semibold text-[16px] text-white">
            {isUploading ? "회원가입 중..." : "다음"}
          </span>
        </button>
      </div>
    </MainContainer>
  );
}
