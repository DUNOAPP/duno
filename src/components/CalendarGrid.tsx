import React, { useMemo } from "react";
import { View, Text } from "react-native";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
} from "date-fns";
import Animated, { FadeIn } from "react-native-reanimated";
import { DayCell } from "./DayCell";
import { useCalendarStore } from "@/lib/state/calendar-store";

interface CalendarEvent {
  id: string;
  startDate: string;
  danceStyles?: Array<{ id: string; name: string; color: string }>;
}

interface CalendarGridProps {
  events: CalendarEvent[];
  onDayPress: (date: Date) => void;
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

export function CalendarGrid({ events, onDayPress }: CalendarGridProps) {
  const currentMonth = useCalendarStore((s) => s.currentMonth);
  const selectedDate = useCalendarStore((s) => s.selectedDate);

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  // Build a map of date string -> event colors for fast lookup
  const eventsByDate = useMemo(() => {
    const map: Record<string, string[]> = {};
    events.forEach((event) => {
      const dateKey = format(new Date(event.startDate), "yyyy-MM-dd");
      if (!map[dateKey]) map[dateKey] = [];
      const color = event.danceStyles?.[0]?.color ?? "#8E8E93";
      map[dateKey].push(color);
    });
    return map;
  }, [events]);

  // Split days into weeks (rows of 7)
  const weeks = useMemo(() => {
    const result: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7));
    }
    return result;
  }, [days]);

  return (
    <Animated.View
      key={format(currentMonth, "yyyy-MM")}
      entering={FadeIn.duration(150)}
      className="px-2"
    >
      {/* Weekday headers */}
      <View className="flex-row mb-2">
        {WEEKDAYS.map((day, i) => (
          <View key={i} className="flex-1 items-center">
            <Text className="text-xs font-semibold text-gray-400 uppercase">
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Day cells */}
      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} className="flex-row">
          {week.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd");
            return (
              <DayCell
                key={dateKey}
                date={day}
                isCurrentMonth={isSameMonth(day, currentMonth)}
                isSelected={isSameDay(day, selectedDate)}
                eventColors={eventsByDate[dateKey] || []}
                onPress={onDayPress}
              />
            );
          })}
        </View>
      ))}
    </Animated.View>
  );
}
