import { authService } from "../utils/auth";

export const MainContainer = ({
  children,
  className,
  bg = "white",
  noPadding = false,
}: {
  children: React.ReactNode;
  className?: string;
  bg?: string;
  noPadding?: boolean;
}) => {
  return (
    <div className="w-full flex justify-center bg-gray-300">
      <div
        className={`mx-auto w-full max-w-[768px] min-h-dvh flex flex-col ${className || ""} bg-white`}
        style={{
          paddingLeft: "var(--safe-left)",
          paddingRight: "var(--safe-right)",
        }}
      >
        <main
          className="flex-1"
          style={{ paddingBottom: "var(--safe-bottom)" }}
        >
          <div
            className={`relative w-full min-h-dvh ${noPadding ? "" : "px-5"} flex flex-col`}
            style={{ backgroundColor: bg }}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainContainer;
