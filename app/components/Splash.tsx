"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

const Splash = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 컴포넌트 마운트 후 애니메이션 시작
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-[#3f55ff] h-dvh w-full flex items-center justify-center overflow-hidden">
      <div
        className={`transition-all duration-1000 ease-out transform ${
          isVisible
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4"
        }`}
      >
        <Image
          src="/images/logo_white.png"
          alt="splash"
          width={56}
          height={70}
        />
      </div>
    </div>
  );
};

export default Splash;
