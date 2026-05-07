import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { isToday as checkIsToday } from "date-fns";
import * as Haptics from "expo-haptics";

interface DayCellProps {
  date: Date;
  isCurrentMonth: boolean;
  isSelected: boolean;
  eventColors: string[];
  onPress: (date: Date) => void;
}

export const DayCell = memo(function DayCell({
  date,
  isCurrentMonth,
  isSelected,
  eventColors,
  onPress,
}: DayCellProps) {
  const isToday = checkIsToday(date);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(date);
  };

  const dayNumber = date.getDate();

  return (
    <Pressable onPress={handlePress} className="flex-1 items-center py-1.5">
      <View
        className={`w-9 h-9 items-center justify-center rounded-full ${
          isToday
            ? "bg-blue-500"
            : isSelected
              ? "bg-blue-500/10 border border-blue-500"
              : ""
        }`}
      >
        <Text
          className={`text-base ${
            isToday
              ? "text-white font-bold"
              : isSelected
                ? "text-blue-500 font-semibold"
                : isCurrentMonth
                  ? "text-gray-900 font-medium"
                  : "text-gray-300"
          }`}
        >
          {dayNumber}
        </Text>
      </View>
      <View className="flex-row gap-0.5 mt-1 h-1.5">
        {eventColors.slice(0, 3).map((color, i) => (
          <View
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: color }}
          />
        ))}
      </View>
    </Pressable>
  );
});
