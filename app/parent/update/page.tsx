"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MainContainer from "../../components/MainContainer";
import Icons from "../../components/Icons";
import DateWheelPicker from "../../components/DateWheelPicker";
import { useAuth } from "../../components/CombinedProvider";
import { api } from "../../utils/api";
import { uploadFile } from "../../utils/upload";
import { getImageUrl } from "../../utils/image";

export default function ParentUpdatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const userInfo = useAuth(); // UserInfo includes memberId

  const petId = searchParams.get("petId");

  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [breed, setBreed] = useState("");
  const [birthday, setBirthday] = useState<Date | null>(null);
  const [imageKey, setImageKey] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [showBirthdayModal, setShowBirthdayModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Pet 정보 조회
  useEffect(() => {
    if (!petId || !userInfo?.id) {
      if (!userInfo?.id) return; // userInfo 로딩 중
      alert("잘못된 접근입니다.");
      router.push("/parent");
      return;
    }

    const fetchPetDetail = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(
          `/api/v1/pets/${petId}/members/${userInfo.id}`,
        );

        if (response.success && response.data) {
          const data = (response.data as any).data;
          setName(data.petName || "");
          setGender(data.petGender || "");
          setBreed(data.petBreed || "");
          setImageKey(data.petImage || "");

          // 생일 파싱 (YYYYMMDD)
          if (data.petBirthday) {
            const year = parseInt(data.petBirthday.substring(0, 4));
            const month = parseInt(data.petBirthday.substring(4, 6)) - 1;
            const day = parseInt(data.petBirthday.substring(6, 8));
            setBirthday(new Date(year, month, day));
          }
        }
      } catch (error) {
        console.error("반려견 정보 조회 실패:", error);
        alert("반려견 정보를 불러오는데 실패했습니다.");
        router.push("/parent");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPetDetail();
  }, [petId, router, userInfo?.id]);

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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleBirthdaySelect = (selectedDate: Date) => {
    setBirthday(selectedDate);
  };

  const formatBirthdayDisplay = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}년 ${month}월 ${day}일`;
  };

  const formatBirthdayApi = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  };

  const handleSave = async () => {
    if (!name?.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }
    if (!breed?.trim()) {
      alert("견종을 선택해주세요.");
      return;
    }
    if (!birthday) {
      alert("생일을 선택해주세요.");
      return;
    }
    if (!gender) {
      alert("성별을 선택해주세요.");
      return;
    }

    if (!confirm("수정하시겠습니까?")) {
      return;
    }

    setIsSaving(true);

    try {
      let finalImageKey = imageKey;

      // 새로운 이미지가 선택되었으면 업로드
      if (selectedFile) {
        finalImageKey = await uploadFile(selectedFile);
      }

      // API 호출
      const requestBody = {
        name: name,
        breed: breed,
        birthday: formatBirthdayApi(birthday),
        gender: gender,
        petImage: finalImageKey,
      };

      const response = await api.put(`/api/v1/pets/${petId}`, requestBody);

      if (response.success) {
        alert("수정이 완료되었습니다.");
        router.push("/parent");
      }
    } catch (error) {
      console.error("수정 실패:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("데이터를 정말로 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await api.delete(`/api/v1/pets/${petId}`);

      if (response.success) {
        alert("삭제되었습니다.");
        router.push("/parent");
      }
    } catch (error) {
      console.error("삭제 실패:", error);
    }
  };

  if (isLoading) {
    return (
      <MainContainer>
        <div className="flex items-center justify-center h-screen">
          <p className="text-[16px] text-[#858585]">로딩 중...</p>
        </div>
      </MainContainer>
    );
  }

  const isFormValid =
    name?.trim() !== "" &&
    breed?.trim() !== "" &&
    birthday !== null &&
    gender !== "";

  return (
    <MainContainer bg="#ffffff" noPadding>
      <div className="w-full min-h-dvh pb-[123px]">
        {/* 상단 헤더 - 뒤로가기만 */}
        <div className="bg-white sticky top-0 z-10">
          <div className="pt-[73px] px-[20px] pb-[20px]">
            <button
              onClick={handleGoBack}
              className="hover:opacity-70 transition-opacity"
            >
              <Icons.Prev className="w-[26px] h-[22px]" />
            </button>
          </div>
        </div>

        {/* 제목 및 삭제 버튼 */}
        <div className="px-[20px] pb-[20px]">
          <div className="flex items-center justify-between">
            <h1 className="text-[20px] font-bold text-[#363e4a]">
              반려동물 정보 수정
            </h1>
            <button
              onClick={handleDelete}
              className="hover:opacity-70 transition-opacity"
            >
              <svg width="17" height="21" viewBox="0 0 17 21" fill="none">
                <path
                  d="M1 5H16M15 5V19C15 19.5304 14.7893 20.0391 14.4142 20.4142C14.0391 20.7893 13.5304 21 13 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V5M4 5V3C4 2.46957 4.21071 1.96086 4.58579 1.58579C4.96086 1.21071 5.46957 1 6 1H11C11.5304 1 12.0391 1.21071 12.4142 1.58579C12.7893 1.96086 13 2.46957 13 3V5"
                  stroke="#858585"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 구분선 */}
        <div className="w-full h-px bg-[#d2d6db]" />

        {/* 컨텐츠 영역 */}
        <div className="px-[20px] pt-[20px]">
          {/* 사진 업로드 영역 */}
          <div className="mb-[20px] flex justify-center">
            <div className="relative">
              <button
                onClick={handleUploadClick}
                className="w-[261px] h-[261px] rounded-[10px] flex flex-col items-center justify-center transition-colors relative bg-[#f0f0f0] overflow-hidden"
              >
                {previewUrl || imageKey ? (
                  <img
                    src={previewUrl || getImageUrl(imageKey) || ""}
                    alt="반려견 사진"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-[52px] h-[52px] rounded-full bg-[#d9d9d9] flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 24 22" fill="none">
                      <path
                        d="M12 15.5C14.4853 15.5 16.5 13.4853 16.5 11C16.5 8.51472 14.4853 6.5 12 6.5C9.51472 6.5 7.5 8.51472 7.5 11C7.5 13.4853 9.51472 15.5 12 15.5Z"
                        stroke="#858585"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M21 19H3C2.45 19 2 18.55 2 18V6C2 5.45 2.45 5 3 5H7L9 3H15L17 5H21C21.55 5 22 5.45 22 6V18C22 18.55 21.55 19 21 19Z"
                        stroke="#858585"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
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

          {/* 이름 */}
          <div className="mb-[20px]">
            <p className="text-[18px] font-semibold text-[#363e4a] mb-[11px]">
              이름
            </p>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                if (e.target.value.length <= 8) {
                  setName(e.target.value);
                }
              }}
              placeholder="1~8자로 입력해주세요"
              maxLength={8}
              className="w-full bg-white rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] h-[57px] px-[20px] text-[14px] font-semibold text-[#6e7783] outline-none focus:ring-2 focus:ring-[#3f55ff] transition-all"
            />
          </div>

          {/* 성별 (수정 불가) */}
          <div className="mb-[20px]">
            <p className="text-[18px] font-semibold text-[#363e4a] mb-[11px]">
              성별
            </p>
            <div className="flex gap-[9px]">
              <div
                className={`flex-1 h-[59px] rounded-[7px] flex items-center justify-center ${
                  gender === "MALE" ? "bg-[#e9fbff]" : "bg-[#f0f0f0]"
                } opacity-60 cursor-not-allowed`}
              >
                <span
                  className={`text-[16px] font-medium ${
                    gender === "MALE" ? "text-[#3f55ff]" : "text-[#d2d2d2]"
                  }`}
                >
                  남아
                </span>
              </div>
              <div
                className={`flex-1 h-[59px] rounded-[7px] flex items-center justify-center ${
                  gender === "FEMALE" ? "bg-[#ffeaef]" : "bg-[#f0f0f0]"
                } opacity-60 cursor-not-allowed`}
              >
                <span
                  className={`text-[16px] font-medium ${
                    gender === "FEMALE" ? "text-[#ff3f52]" : "text-[#d2d2d2]"
                  }`}
                >
                  여아
                </span>
              </div>
            </div>
          </div>

          {/* 견종 (수정 불가) */}
          <div className="mb-[20px]">
            <p className="text-[18px] font-semibold text-[#363e4a] mb-[11px]">
              견종
            </p>
            <div className="w-full bg-white rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] h-[57px] px-[20px] flex items-center opacity-60 cursor-not-allowed">
              <p className="text-[14px] font-semibold text-[#6e7783]">
                {breed || "견종을 선택해주세요"}
              </p>
            </div>
          </div>

          {/* 생일 */}
          <div className="mb-[20px]">
            <p className="text-[18px] font-semibold text-[#363e4a] mb-[11px]">
              생일
            </p>
            <button
              onClick={() => setShowBirthdayModal(true)}
              className="w-full bg-white rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1)] h-[57px] px-[20px] flex items-center"
            >
              <p className="text-[14px] font-semibold text-[#6e7783]">
                {birthday
                  ? formatBirthdayDisplay(birthday)
                  : "생일을 선택해주세요"}
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white px-[20px] py-[25px] border-t border-[#f0f0f0]">
        <button
          onClick={handleSave}
          disabled={!isFormValid || isSaving}
          className={`w-full h-[59px] rounded-[7px] flex items-center justify-center transition-colors ${
            isFormValid && !isSaving
              ? "bg-[#3f55ff] hover:bg-[#3646e6] cursor-pointer"
              : "bg-[#f0f0f0] cursor-not-allowed"
          }`}
        >
          <span className="font-semibold text-white text-[16px]">
            {isSaving ? "저장 중..." : "저장하기"}
          </span>
        </button>
      </div>

      {/* 생일 선택 모달 */}
      <DateWheelPicker
        isOpen={showBirthdayModal}
        onClose={() => setShowBirthdayModal(false)}
        selectedDate={birthday || new Date()}
        onDateSelect={handleBirthdaySelect}
        title="반려견 생일 변경"
      />
    </MainContainer>
  );
}
