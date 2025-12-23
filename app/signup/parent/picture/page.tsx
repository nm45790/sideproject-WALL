"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import MainContainer from "../../../components/MainContainer";
import Icons from "../../../components/Icons";
import { useSignupStore } from "../../../store/signupStore";
import { tokenManager } from "../../../utils/cookies";

export default function ParentPicturePage() {
  const router = useRouter();
  const {
    signupData,
    updatePetImageKey,
    updatePetImageUrl,
    isParentOnboardingCompleted,
  } = useSignupStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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

  // 저장된 이미지 URL이 있으면 미리보기 표시
  useEffect(() => {
    if (signupData.petImageUrl) {
      setPreviewUrl(signupData.petImageUrl);
    }
  }, [signupData.petImageUrl]);

  const handleGoBack = () => {
    router.back();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // 기존 미리보기 URL 정리 (blob URL인 경우)
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      // 미리보기 URL 생성
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      // 새로운 파일을 선택하면 저장된 이미지 키와 URL 초기화
      updatePetImageKey("");
      updatePetImageUrl("");
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    if (previewUrl) {
      // Object URL인 경우에만 revoke (새로 선택한 파일의 경우)
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
    }
    // 저장된 이미지 키와 URL 초기화
    updatePetImageKey("");
    updatePetImageUrl("");
    // 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleNext = async () => {
    // 새로운 파일이 선택되지 않았고, 저장된 이미지 URL도 없으면 에러
    if (!selectedFile && !signupData.petImageUrl) {
      alert("사진을 선택해주세요.");
      return;
    }

    setIsUploading(true);

    try {
      let finalImageKey = signupData.petImageKey;
      let finalImageUrl = signupData.petImageUrl;

      // 새로운 파일이 선택된 경우에만 업로드
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const accessToken = tokenManager.getAccessToken();
        const baseURL = process.env.NEXT_PUBLIC_API_URL || "";
        const targetUrl = `${baseURL}/api/v1/s3/upload`;
        const isProduction = process.env.NODE_ENV === "production";

        const headers: Record<string, string> = {};
        if (accessToken) {
          headers["Authorization"] = `Bearer ${accessToken}`;
        }

        let response: Response;

        if (isProduction) {
          formData.append("url", targetUrl);
          response = await fetch("/api/proxy", {
            method: "POST",
            headers,
            body: formData,
          });
        } else {
          response = await fetch(targetUrl, {
            method: "POST",
            headers,
            body: formData,
          });
        }

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.status}`);
        }

        const data = await response.json();

        if (data.code !== 200) {
          throw new Error(`Upload failed with code: ${data.code}`);
        }

        finalImageKey = data.data.s3Key;
        finalImageUrl = data.data.presignedUrl;

        updatePetImageKey(finalImageKey);
        updatePetImageUrl(finalImageUrl);

        console.log("Upload successful, s3Key:", finalImageKey);
        console.log("Upload successful, presignedUrl:", finalImageUrl);
      }

      console.log("반려동물 등록 데이터:", {
        name: signupData.petName,
        breed: signupData.petBreed,
        birthday: signupData.petBirthday,
        gender: signupData.petGender,
        imageKey: finalImageKey,
        imageUrl: finalImageUrl,
      });

      // 성공 시 다음 페이지로 이동
      router.push("/signup/parent/academy");
    } catch (error) {
      console.error("등록 실패:", error);
      alert("등록에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsUploading(false);
    }
  };

  const isFormValid = selectedFile !== null || signupData.petImageUrl !== "";

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
        <div className="mb-[8px]">
          <h2 className="text-[25px] font-bold text-gray-900 leading-[30px] mb-[8px]">
            사진을 등록해주세요!
          </h2>
          <p className="text-[16px] font-medium text-[#858585] leading-[20px]">
            우리 아이가 가장 잘나온 사진을 넣어주세요!
            <br />
            모두가 함께 보는 사진이예요!
          </p>
        </div>

        {/* 사진 업로드 영역 */}
        <div className="mb-[25px] mt-[53px] flex justify-center">
          <div className="relative">
            {/* 업로드 버튼 */}
            <button
              onClick={handleUploadClick}
              className={`w-[261px] h-[261px] rounded-[10px] flex flex-col items-center justify-center transition-colors relative ${
                selectedFile ? "bg-white" : "bg-[#f0f0f0] hover:bg-[#e8e8e8]"
              }`}
            >
              {previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    alt="미리보기"
                    className="w-full h-full object-cover rounded-[10px]"
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
                        stroke="#c2c2c2"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M21 19H3C2.45 19 2 18.55 2 18V6C2 5.45 2.45 5 3 5H7L9 3H15L17 5H21C21.55 5 22 5.45 22 6V18C22 18.55 21.55 19 21 19Z"
                        stroke="#c2c2c2"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
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
            {isUploading ? "등록 중..." : "다음"}
          </span>
        </button>
      </div>
    </MainContainer>
  );
}
