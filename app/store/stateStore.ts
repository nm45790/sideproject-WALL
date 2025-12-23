import { create } from "zustand";
import { persist } from "zustand/middleware";

interface StateStore {
  // 선택된 날짜 (academy 페이지용) - ISO 문자열로 저장
  selectedDateString: string;
  updateSelectedDate: (date: Date) => void;
  getSelectedDate: () => Date;
}

export const useStateStore = create<StateStore>()(
  persist(
    (set, get) => {
      // 초기값: persist가 저장된 값을 복원하거나, 없으면 클라이언트에서만 오늘 날짜로 설정
      const getInitialDate = () => {
        if (typeof window === "undefined") {
          // 서버 사이드에서는 빈 문자열 반환 (persist가 복원한 값 사용)
          return "";
        }
        // 클라이언트에서만 오늘 날짜로 초기화 (persist에 저장된 값이 없을 때만 사용됨)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today.toISOString();
      };

      return {
        selectedDateString: getInitialDate(),
        updateSelectedDate: (date: Date) => {
          const dateCopy = new Date(date);
          dateCopy.setHours(0, 0, 0, 0);
          set({ selectedDateString: dateCopy.toISOString() });
        },
        getSelectedDate: () => {
          const stored = get().selectedDateString;
          if (!stored) {
            // 저장된 값이 없으면 오늘 날짜 반환
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return today;
          }
          const date = new Date(stored);
          date.setHours(0, 0, 0, 0);
          return date;
        },
      };
    },
    {
      name: "academy-state-storage",
    },
  ),
);
