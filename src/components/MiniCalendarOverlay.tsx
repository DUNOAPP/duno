import React, { useMemo, useRef, useEffect } from "react";
import { View, Text, Pressable, ScrollView, Platform } from "react-native";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  addMonths,
  isToday,
  isSameDay,
} from "date-fns";
import * as Haptics from "expo-haptics";
import { useThemeStore } from "@/lib/state/theme-store";
import { getTheme } from "@/lib/constants/theme";

const systemFont = Platform.select({
  ios: { fontFamily: "System" },
  default: {},
});

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];
const ROW_HEIGHT = 36;
const MONTH_HEADER_HEIGHT = 28;
const WEEKDAY_HEADER_HEIGHT = 28;
const DAY_SIZE = 30;

interface MiniCalendarOverlayProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onDismiss: () => void;
}

function generateMiniMonthsData(startMonth: Date, monthCount: number) {
  const months = [];
  let cumulativeHeight = 0;

  for (let i = 0; i < monthCount; i++) {
    const monthDate = addMonths(startMonth, i);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const startWeekday = (monthStart.getDay() + 6) % 7;
    const totalCells = startWeekday + days.length;
    const weekCount = Math.ceil(totalCells / 7);
    const monthHeight = MONTH_HEADER_HEIGHT + weekCount * ROW_HEIGHT;

    months.push({
      date: monthDate,
      days,
      monthStart,
      startWeekday,
      offsetY: cumulativeHeight,
      height: monthHeight,
    });

    cumulativeHeight += monthHeight;
  }
  return { months, totalHeight: cumulativeHeight };
}

export function MiniCalendarOverlay({
  selectedDate,
  onSelectDate,
  onDismiss,
}: MiniCalendarOverlayProps) {
  const isDarkMode = useThemeStore((s) => s.isDarkMode);
  const theme = getTheme(isDarkMode);
  const scrollRef = useRef<ScrollView>(null);

  const startMonth = useMemo(() => {
    const d = new Date(selectedDate);
    return new Date(d.getFullYear(), d.getMonth() - 2, 1);
  }, [selectedDate]);

  const { months, totalHeight } = useMemo(
    () => generateMiniMonthsData(startMonth, 6),
    [startMonth]
  );

  // Scroll to selected month on open
  useEffect(() => {
    const selectedMonthIndex = months.findIndex(
      (m) =>
        m.date.getFullYear() === selectedDate.getFullYear() &&
        m.date.getMonth() === selectedDate.getMonth()
    );
    if (selectedMonthIndex >= 0 && scrollRef.current) {
      const offset = months[selectedMonthIndex].offsetY;
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: offset, animated: false });
      }, 50);
    }
  }, []);

  return (
    <View style={{ position: "relative" }}>
      {/* Dismiss backdrop */}
      <Pressable
        onPress={onDismiss}
        style={{
          position: "absolute",
          top: -1000,
          left: -1000,
          right: -1000,
          bottom: -1000,
          zIndex: -1,
        }}
      />

      {/* Calendar panel */}
      <View
        style={{
          position: "absolute",
          top: 8,
          left: -20,
          right: -20,
          maxHeight: 340,
          zIndex: 10000,
          borderRadius: 14,
          overflow: "hidden",
          backgroundColor: theme.dropdownBg,
          borderWidth: isDarkMode ? 0 : 1,
          borderColor: theme.dropdownBorder,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 10,
        }}
      >
        {/* Weekday header */}
        <View
          className="flex-row"
          style={{
            paddingHorizontal: 12,
            paddingTop: 12,
            paddingBottom: 4,
          }}
        >
          {WEEKDAYS.map((day, i) => (
            <View key={i} className="flex-1 items-center">
              <Text
                style={[
                  systemFont,
                  {
                    fontSize: 11,
                    fontWeight: "600",
                    color: theme.weekdayText,
                  },
                ]}
              >
                {day}
              </Text>
            </View>
          ))}
        </View>

        {/* Scrollable months */}
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          style={{ maxHeight: 340 - WEEKDAY_HEADER_HEIGHT - 12 }}
          contentContainerStyle={{ paddingBottom: 8 }}
        >
          {months.map((month, monthIndex) => {
            const allCells: (Date | null)[] = [];
            for (let i = 0; i < month.startWeekday; i++) {
              allCells.push(null);
            }
            allCells.push(...month.days);
            const remainder = allCells.length % 7;
            if (remainder > 0) {
              for (let i = 0; i < 7 - remainder; i++) {
                allCells.push(null);
              }
            }
            const weeks: (Date | null)[][] = [];
            for (let i = 0; i < allCells.length; i += 7) {
              weeks.push(allCells.slice(i, i + 7));
            }

            return (
              <View key={format(month.date, "yyyy-MM")}>
                {/* Month label */}
                <View
                  className="flex-row"
                  style={{
                    height: MONTH_HEADER_HEIGHT,
                    paddingHorizontal: 12,
                    alignItems: "center",
                  }}
                >
                  {Array.from({ length: 7 }).map((_, colIndex) => (
                    <View key={colIndex} className="flex-1 items-center">
                      {colIndex === month.startWeekday ? (
                        <Text
                          style={[
                            systemFont,
                            {
                              fontSize: 13,
                              fontWeight: "700",
                              color: theme.monthText,
                            },
                          ]}
                        >
                          {monthIndex === 0
                            ? format(month.date, "MMMM")
                            : format(month.date, "MMM")}
                        </Text>
                      ) : null}
                    </View>
                  ))}
                </View>

                {/* Week rows */}
                {weeks.map((week, weekIndex) => (
                  <View
                    key={weekIndex}
                    className="flex-row"
                    style={{ height: ROW_HEIGHT, paddingHorizontal: 12 }}
                  >
                    {week.map((day, dayIndex) => {
                      if (!day) {
                        return (
                          <View key={`empty-${dayIndex}`} className="flex-1" />
                        );
                      }

                      const isTodayDate = isToday(day);
                      const isSelected = isSameDay(day, selectedDate);
                      const highlighted = isTodayDate || isSelected;

                      return (
                        <View key={format(day, "yyyy-MM-dd")} className="flex-1 items-center justify-center">
                          <Pressable
                            onPress={() => {
                              Haptics.impactAsync(
                                Haptics.ImpactFeedbackStyle.Light
                              );
                              onSelectDate(day);
                            }}
                          >
                            <View
                              style={{
                                width: DAY_SIZE,
                                height: DAY_SIZE,
                                borderRadius: DAY_SIZE / 2,
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor: highlighted
                                  ? theme.todayCircle
                                  : "transparent",
                              }}
                            >
                              <Text
                                style={[
                                  systemFont,
                                  {
                                    fontSize: 14,
                                    fontWeight: highlighted ? "600" : "400",
                                    color: highlighted
                                      ? theme.todayText
                                      : theme.dayText,
                                  },
                                ]}
                              >
                                {format(day, "d")}
                              </Text>
                            </View>
                          </Pressable>
                        </View>
                      );
                    })}
                  </View>
                ))}
              </View>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}
