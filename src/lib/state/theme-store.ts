import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ThemeState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
  hydrated: boolean;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDarkMode: true, // Default: night mode ON
  hydrated: false,
  toggleDarkMode: () =>
    set((state) => {
      const newValue = !state.isDarkMode;
      AsyncStorage.setItem("isDarkMode", JSON.stringify(newValue));
      return { isDarkMode: newValue };
    }),
  setDarkMode: (value: boolean) => {
    AsyncStorage.setItem("isDarkMode", JSON.stringify(value));
    set({ isDarkMode: value });
  },
}));

// Hydrate from AsyncStorage on app start
AsyncStorage.getItem("isDarkMode").then((value) => {
  if (value !== null) {
    useThemeStore.setState({ isDarkMode: JSON.parse(value), hydrated: true });
  } else {
    useThemeStore.setState({ hydrated: true });
  }
});
