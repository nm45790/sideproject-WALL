"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import MainContainer from "../../components/MainContainer";
import Icons from "../../components/Icons";
import PageHeader from "../../components/PageHeader";
import { useSignupStore } from "../../store/signupStore";

type Agreement = {
  id: string;
  title: string;
  required: boolean;
  checked: boolean;
};

export default function TermsPage() {
  const router = useRouter();
  const { signupData, updateTermsSelectOption, isAllRequiredTermsAgreed } =
    useSignupStore();

  const [showTermsModal, setShowTermsModal] = useState(false);
  const [selectedTermsId, setSelectedTermsId] = useState<string>("");
  const isNavigatingToNext = useRef(false);

  // 약관 내용 정의
  const termsContent = {
    service: {
      title: "서비스 이용약관 동의",
      content: [
        {
          title: "제1조(목적)",
          text: '본 약관은 디버깅히어로즈(이하 "회사")가 운영하는 \'왈\' 플랫폼(이하 "서비스")의 이용과 관련하여 회사와 회원 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.',
        },
        {
          title: "제2조(정의)",
          items: [
            '"서비스"란 보호자와 애견 유치원 간의 등원 예약, 결제, 활동 기록 전송 등의 기능을 제공하는 온라인 플랫폼을 의미합니다.',
            '"회원"이란 본 약관에 따라 가입하고 서비스를 이용하는 자를 말하며, "보호자 회원"과 "유치원 회원"으로 구분됩니다.',
            '"콘텐츠"란 회원이 서비스 내에서 작성·등록·전송하는 사진, 글, 가격표 등을 말합니다.',
          ],
        },
        {
          title: "제3조(약관의 효력 및 변경)",
          items: [
            "본 약관은 서비스 가입 시 동의 절차를 거친 후 효력이 발생합니다.",
            "회사는 관련 법령을 위반하지 않는 범위에서 약관을 개정할 수 있으며, 변경 시 서비스 공지사항을 통해 사전 고지합니다.",
          ],
        },
        {
          title: "제4조(서비스 제공)",
          items: [
            "회사는 회원 간 예약·결제·소통이 원활하게 이루어질 수 있도록 플랫폼을 제공합니다.",
            "회사는 안정적인 서비스 제공을 위해 정기점검, 시스템 개선 등을 실시할 수 있습니다.",
          ],
        },
        {
          title: "제5조(회원의 의무)",
          items: [
            "회원은 서비스 이용 시 허위 정보를 등록해서는 안 되며, 타인의 권리를 침해하는 행위를 해서는 안 됩니다.",
            "유치원 회원은 정확한 가격·운영 정보, 활동 기록을 성실히 제공해야 하며, 보호자 회원은 예약 및 결제 의무를 성실히 이행해야 합니다.",
          ],
        },
        {
          title: "제6조(회사의 의무)",
          text: "회사는 관련 법령과 본 약관에 따라 서비스를 안정적으로 운영하며, 회원의 개인정보 보호를 위해 노력합니다.",
        },
        {
          title: "제7조(면책 조항)",
          items: [
            "회사는 회원 간 거래·소통에서 발생하는 분쟁에 개입하지 않으며, 해당 내용의 사실 여부에 대한 책임을 지지 않습니다.",
            "천재지변, 시스템 장애 등 불가항력 사유로 인한 서비스 중단에 대해서는 책임을 지지 않습니다.",
          ],
        },
        {
          title: "제8조(계약 해지 및 탈퇴)",
          text: "회원은 언제든지 서비스 내 설정 메뉴를 통해 탈퇴할 수 있습니다. 단, 결제·환불 절차가 남아 있는 경우 완료 후 탈퇴됩니다.",
        },
      ],
    },
  };

  // Store 데이터를 기반으로 agreements 배열 생성
  const agreements: Agreement[] = [
    {
      id: "service",
      title: "(필수) 서비스 이용약관 동의",
      required: true,
      checked: signupData.termsSelectOption.service,
    },
    {
      id: "privacy",
      title: "(필수) 개인정보 수집 및 이용 동의",
      required: true,
      checked: signupData.termsSelectOption.privacy,
    },
    {
      id: "thirdParty",
      title: "(필수) 개인정보 제3자 제공 동의",
      required: true,
      checked: signupData.termsSelectOption.thirdParty,
    },
    {
      id: "payment",
      title: "(필수) 결제 서비스 이용약관",
      required: true,
      checked: signupData.termsSelectOption.payment,
    },
    {
      id: "marketing",
      title: "(선택) 광고성 정보 수신 전체 동의",
      required: false,
      checked: signupData.termsSelectOption.marketing,
    },
  ];

  // 전체 동의 상태 계산
  const allAgreed = Object.values(signupData.termsSelectOption).every(Boolean);

  const handleAllAgreeToggle = () => {
    const newAllAgreed = !allAgreed;

    // Store 업데이트
    updateTermsSelectOption({
      service: newAllAgreed,
      privacy: newAllAgreed,
      thirdParty: newAllAgreed,
      payment: newAllAgreed,
      marketing: newAllAgreed,
    });
  };

  const handleAgreementToggle = (id: string) => {
    const agreement = agreements.find((a) => a.id === id);
    if (!agreement) return;

    const newChecked = !agreement.checked;

    // Store 업데이트
    updateTermsSelectOption({
      [id]: newChecked,
    });
  };

  const handleViewTerms = (id: string) => {
    setSelectedTermsId(id);
    setShowTermsModal(true);
  };

  const handleCloseModal = () => {
    setShowTermsModal(false);
    setSelectedTermsId("");
  };

  const allRequiredChecked = isAllRequiredTermsAgreed();

  // 컴포넌트 언마운트 시 체크박스 전부 해제 (정상적인 다음 페이지 이동이 아닐 때만)
  useEffect(() => {
    return () => {
      if (!isNavigatingToNext.current) {
        updateTermsSelectOption({
          service: false,
          privacy: false,
          thirdParty: false,
          payment: false,
          marketing: false,
        });
      }
    };
  }, [updateTermsSelectOption]);

  const handleNext = () => {
    if (allRequiredChecked) {
      isNavigatingToNext.current = true;
      router.push("/signup/details");
    }
  };

  return (
    <MainContainer>
      {/* Close 버튼 영역 */}
      <PageHeader variant="close" onBack={() => router.replace("/")} />

      {/* 제목 영역 */}
      <div className="pt-7">
        <h1 className="text-2xl font-bold text-gray-900 leading-[30px]">
          회원가입
        </h1>
        <p className="mt-3 text-[#939393] text-sm font-medium">
          사랑하는 반려견의 하루를 간편하게 연결하세요!
        </p>
      </div>

      {/* 약관 동의 영역 */}
      <div className="flex flex-col pt-16 text-[#8E8E8E] pb-5">
        {/* 전체 동의 */}
        <div>
          <button onClick={handleAllAgreeToggle} className="flex items-center">
            <Icons.Checkbox checked={allAgreed} className="w-5 h-5 mr-2" />
            <span className="text-[16px] font-bold">약관 전체 동의</span>
          </button>
        </div>

        {/* 구분선 */}
        <div className="w-full h-[1px] bg-[#e5e5e5] my-4"></div>

        {/* 개별 약관들 */}
        <div className="space-y-[19px] px-5">
          {agreements.map((agreement, index) => (
            <div
              key={agreement.id}
              className="flex items-center justify-between"
            >
              <button
                onClick={() => handleAgreementToggle(agreement.id)}
                className="flex items-center flex-1"
              >
                <Icons.Checkbox
                  checked={agreement.checked}
                  className="w-5 h-5 mr-[8px]"
                />
                <span className="text-[13px] font-medium text-left">
                  {agreement.title}
                </span>
              </button>
              <button
                onClick={() => handleViewTerms(agreement.id)}
                className="text-[12px] font-medium text-[#3f55ff] ml-4"
              >
                보기
              </button>
            </div>
          ))}
        </div>

        {/* 광고성 정보 수신 안내 */}
        <div className="pl-12 pr-4 mt-3">
          <p className="text-[13px] font-medium text-[#5a5a5a] leading-[16px]">
            광고성 정보 수신에 동의하시면, 이벤트 및 할인 혜택 안내를 누구보다
            빠르게 받아보실 수 있어요!
          </p>
        </div>
      </div>

      {/* 동의하고 가입하기 버튼 */}
      <div className="flex-1 flex items-end pb-5">
        <button
          onClick={handleNext}
          disabled={!allRequiredChecked}
          className={`w-full h-[59px] rounded-[7px] flex items-center justify-center transition-colors mt-auto ${
            allRequiredChecked
              ? "bg-[#3f55ff] hover:bg-[#3646e6] cursor-pointer"
              : "bg-[#f0f0f0] cursor-not-allowed"
          }`}
        >
          <span className="font-semibold text-[16px] text-white">
            동의하고 가입하기
          </span>
        </button>
      </div>

      {/* 약관 상세 모달 */}
      {showTermsModal && selectedTermsId && (
        <div className="fixed inset-0 z-[9999] flex items-end">
          {/* 백드롭 */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={handleCloseModal}
          />

          {/* 모달 컨텐츠 */}
          <div className="relative bg-white rounded-t-[20px] w-full h-[90vh] animate-slide-up z-[10000] flex flex-col">
            {/* 헤더 */}
            <div className="flex items-center justify-between p-5 border-b border-[#e5e5e5]">
              <h2 className="text-[25px] font-bold text-gray-900">
                서비스 이용약관 동의
              </h2>
              <button onClick={handleCloseModal} className="p-2">
                <Icons.Close className="w-[17px] h-[17px] text-gray-900" />
              </button>
            </div>

            {/* 스크롤 가능한 콘텐츠 */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="space-y-6">
                {termsContent.service.content.map((section, index) => (
                  <div key={index}>
                    <h3 className="text-[13px] font-semibold text-black mb-3">
                      {section.title}
                    </h3>
                    <div className="bg-[#f9f9f9] rounded-[7px] p-5">
                      {section.text ? (
                        <p className="text-[13px] font-normal text-black leading-[17px]">
                          {section.text}
                        </p>
                      ) : section.items ? (
                        <ol
                          className="text-[13px] font-normal text-black leading-[17px] space-y-2"
                          style={{
                            listStyleType: "decimal",
                            paddingLeft: "20px",
                          }}
                        >
                          {section.items.map((item, itemIndex) => (
                            <li key={itemIndex} className="mb-2">
                              {item}
                            </li>
                          ))}
                        </ol>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 하단 버튼 */}
            <div className="p-5 border-t border-[#e5e5e5]">
              <button
                onClick={() => {
                  // 전체 동의 처리
                  updateTermsSelectOption({
                    service: true,
                    privacy: true,
                    thirdParty: true,
                    payment: true,
                    marketing: true,
                  });
                  handleCloseModal();
                }}
                className="w-full h-[59px] bg-[#3f55ff] rounded-[7px] flex items-center justify-center"
              >
                <span className="text-[16px] font-semibold text-white">
                  전체 동의
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </MainContainer>
  );
}
