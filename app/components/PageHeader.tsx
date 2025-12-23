"use client";

import { useRouter } from "next/navigation";
import Icons from "./Icons";

interface PageHeaderProps {
  title?: string;
  variant?: "back" | "close";
  onBack?: () => void;
}

export default function PageHeader({
  title,
  variant = "back",
  onBack,
}: PageHeaderProps) {
  const router = useRouter();
  const handleGoBack = onBack || (() => router.back());

  return (
    <div
      className={`relative flex items-center pt-[45px] ${
        title ? "justify-center" : ""
      }`}
    >
      <button
        onClick={handleGoBack}
        className={`p-[18px] w-[57px] h-[57px] flex items-center justify-center -ml-[18px] ${
          title ? "absolute left-0" : ""
        }`}
      >
        {variant === "close" ? (
          <Icons.Close className="w-[17px] h-[17px] text-gray-900" />
        ) : (
          <Icons.Prev className="w-[26px] h-[22px]" />
        )}
      </button>
      {title && (
        <h1 className="text-18px font-bold text-gray-900 leading-[30px]">
          {title}
        </h1>
      )}
    </div>
  );
}
