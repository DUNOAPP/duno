import React from "react";
import { View, Text, Pressable } from "react-native";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { format } from "date-fns";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn } from "react-native-reanimated";
import { useCalendarStore } from "@/lib/state/calendar-store";

export function CalendarHeader() {
  const currentMonth = useCalendarStore((s) => s.currentMonth);
  const goToNextMonth = useCalendarStore((s) => s.goToNextMonth);
  const goToPrevMonth = useCalendarStore((s) => s.goToPrevMonth);
  const goToToday = useCalendarStore((s) => s.goToToday);

  const handlePrev = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    goToPrevMonth();
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    goToNextMonth();
  };

  const handleToday = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    goToToday();
  };

  const monthYear = format(currentMonth, "MMMM yyyy");

  return (
    <View className="px-5 pt-2 pb-3">
      <View className="flex-row items-center justify-between">
        <Animated.Text
          key={monthYear}
          entering={FadeIn.duration(200)}
          className="text-2xl font-bold text-black tracking-tight"
        >
          {monthYear}
        </Animated.Text>
        <View className="flex-row items-center gap-1">
          <Pressable
            onPress={handleToday}
            className="px-3 py-1.5 rounded-full bg-gray-100 mr-2 active:opacity-60"
          >
            <Text className="text-sm font-semibold text-blue-500">Today</Text>
          </Pressable>
          <Pressable
            onPress={handlePrev}
            className="w-9 h-9 items-center justify-center rounded-full active:bg-gray-100"
          >
            <ChevronLeft size={22} color="#007AFF" />
          </Pressable>
          <Pressable
            onPress={handleNext}
            className="w-9 h-9 items-center justify-center rounded-full active:bg-gray-100"
          >
            <ChevronRight size={22} color="#007AFF" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
