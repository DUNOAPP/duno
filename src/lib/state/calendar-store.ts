import { create } from "zustand";

type DanceStyle = string;
type City = string;

interface CalendarState {
  selectedDate: Date;
  currentMonth: Date;
  danceStyle: DanceStyle;
  city: City;
  setSelectedDate: (date: Date) => void;
  setCurrentMonth: (date: Date) => void;
  setDanceStyle: (style: DanceStyle) => void;
  setCity: (city: City) => void;
  goToNextMonth: () => void;
  goToPrevMonth: () => void;
  goToToday: () => void;
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  selectedDate: new Date(),
  currentMonth: new Date(),
  danceStyle: "All Styles",
  city: "Barcelona",
  setSelectedDate: (date) => set({ selectedDate: date }),
  setCurrentMonth: (date) => set({ currentMonth: date }),
  setDanceStyle: (style) => set({ danceStyle: style }),
  setCity: (city) => set({ city }),
  goToNextMonth: () => {
    const current = get().currentMonth;
    set({
      currentMonth: new Date(
        current.getFullYear(),
        current.getMonth() + 1,
        1
      ),
    });
  },
  goToPrevMonth: () => {
    const current = get().currentMonth;
    set({
      currentMonth: new Date(
        current.getFullYear(),
        current.getMonth() - 1,
        1
      ),
    });
  },
  goToToday: () => {
    const today = new Date();
    set({ selectedDate: today, currentMonth: today });
  },
}));
