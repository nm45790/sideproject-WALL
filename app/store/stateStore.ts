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
    (set, get) => ({
      selectedDateString: new Date().toISOString(),
      updateSelectedDate: (date: Date) =>
        set({ selectedDateString: date.toISOString() }),
      getSelectedDate: () => new Date(get().selectedDateString),
    }),
    {
      name: "academy-state-storage",
    },
  ),
);
