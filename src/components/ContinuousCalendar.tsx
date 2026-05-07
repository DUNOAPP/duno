import React, { useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView, NativeScrollEvent, NativeSyntheticEvent, Platform } from "react-native";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  addMonths,
  isToday,
} from "date-fns";
import * as Haptics from "expo-haptics";
import { useCalendarStore } from "@/lib/state/calendar-store";
import { useThemeStore } from "@/lib/state/theme-store";
import { getTheme } from "@/lib/constants/theme";
import { UI_COLORS, DANCE_STYLE_COLORS_FALLBACK } from "@/lib/constants/colors";
import { useDanceStyles, buildStyleColorMap } from "@/lib/hooks/useDanceStyles";

// Use SF Pro system font on iOS for Apple Calendar style
const systemFont = Platform.select({
  ios: { fontFamily: "System" },
  default: {},
});

interface CalendarEvent {
  id: string;
  startDate: string;
  danceStyles?: Array<{ id: string; name: string; color: string }>;
}

interface ContinuousCalendarProps {
  events: CalendarEvent[];
  onDayPress: (date: Date) => void;
  selectedDanceStyle?: string;
}

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];

// Generate calendar data for multiple months - only actual month days, no overflow
function generateMonthsData(startMonth: Date, monthCount: number) {
  const months = [];
  let cumulativeHeight = 0;

  for (let i = 0; i < monthCount; i++) {
    const monthDate = addMonths(startMonth, i);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);

    // Only include actual days of this month, no overflow from previous/next months
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Calculate starting weekday (0 = Monday, 6 = Sunday)
    const startWeekday = (monthStart.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0

    // Calculate total cells needed
    const totalCells = startWeekday + days.length;
    const weekCount = Math.ceil(totalCells / 7);

    // Calculate height: month header (80px) + weeks (64px each) + bottom padding (16px)
    const monthHeight = 80 + (weekCount * 64) + 16;

    months.push({
      date: monthDate,
      days,
      monthStart,
      startWeekday, // How many empty cells before first day
      offsetY: cumulativeHeight,
      height: monthHeight,
    });

    cumulativeHeight += monthHeight;
  }
  return months;
}

export function ContinuousCalendar({ events, onDayPress, selectedDanceStyle }: ContinuousCalendarProps) {
  const selectedDate = useCalendarStore((s) => s.selectedDate);
  const isDarkMode = useThemeStore((s) => s.isDarkMode);
  const theme = getTheme(isDarkMode);

  const { data: danceStylesData = [] } = useDanceStyles();
  const styleColorMap = useMemo(() => {
    const apiMap = buildStyleColorMap(danceStylesData);
    return { ...DANCE_STYLE_COLORS_FALLBACK, ...apiMap };
  }, [danceStylesData]);

  // Initialize with current month name
  const [currentMonthName, setCurrentMonthName] = useState(() => {
    return format(new Date(), "MMMM");
  });

  // Generate 12 months starting from current month
  const months = useMemo(() => {
    const now = new Date();
    return generateMonthsData(new Date(now.getFullYear(), now.getMonth(), 1), 12);
  }, []);

  // Build a map of date string -> unique colors derived from dance style data
  // When a specific dance style is selected, only show that style's color
  const eventsByDate = useMemo(() => {
    const map: Record<string, string[]> = {};
    events.forEach((event) => {
      const dateKey = format(new Date(event.startDate), "yyyy-MM-dd");
      if (!map[dateKey]) map[dateKey] = [];

      const styles: string[] = (event.danceStyles && event.danceStyles.length > 0)
        ? event.danceStyles.map((ds) => ds.name)
        : [];

      // Normalize styles to capitalized form for color lookup
      const normalizeStyle = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

      // If a specific dance style is selected, only show that style's color
      if (selectedDanceStyle && selectedDanceStyle !== "All Styles") {
        const hasStyle = styles.some(
          (s) => s.toLowerCase() === selectedDanceStyle.toLowerCase()
        );
        if (hasStyle) {
          const normalized = normalizeStyle(selectedDanceStyle);
          const color = styleColorMap[normalized] || styleColorMap[selectedDanceStyle];
          if (color && !map[dateKey].includes(color)) {
            map[dateKey].push(color);
          }
        }
      } else {
        // Show only Salsa, Bachata, Kizomba dance style colors
        const ALLOWED_STYLES = ["Salsa", "Bachata", "Kizomba"];
        styles
          .filter((s) => ALLOWED_STYLES.includes(normalizeStyle(s)))
          .forEach((style) => {
            const normalized = normalizeStyle(style);
            const color = styleColorMap[normalized] || styleColorMap[style];
            if (color && !map[dateKey].includes(color)) {
              map[dateKey].push(color);
            }
          });
      }
    });
    return map;
  }, [events, selectedDanceStyle, styleColorMap]);

  const handleDayPress = (date: Date) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDayPress(date);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollY = event.nativeEvent.contentOffset.y;

    // Find which month is currently visible based on scroll position
    // Add offset for the weekday header and some buffer
    const adjustedScrollY = scrollY + 100;

    for (let i = months.length - 1; i >= 0; i--) {
      if (adjustedScrollY >= months[i].offsetY) {
        const newMonthName = format(months[i].date, "MMMM");
        if (newMonthName !== currentMonthName) {
          setCurrentMonthName(newMonthName);
        }
        break;
      }
    }
  };

  const MONTH_HEADER_HEIGHT = 48;
  const WEEKDAY_HEADER_HEIGHT = 32;

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      {/* Fixed Month Label - Apple Calendar style */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: MONTH_HEADER_HEIGHT,
          backgroundColor: theme.background,
          zIndex: 11,
        }}
      >
        <View className="px-5 pt-2 pb-1">
          <Text
            style={[systemFont, { fontSize: 34, fontWeight: '700', letterSpacing: 0.4, color: theme.monthText }]}
            allowFontScaling={true}
          >
            {currentMonthName}
          </Text>
        </View>
      </View>

      {/* Fixed Weekday Header - Apple Calendar style */}
      <View
        style={{
          position: 'absolute',
          top: MONTH_HEADER_HEIGHT,
          left: 0,
          right: 0,
          height: WEEKDAY_HEADER_HEIGHT,
          backgroundColor: theme.background,
          zIndex: 10,
        }}
      >
        <View className="flex-row px-5 py-2">
          {WEEKDAYS.map((day, i) => (
            <View key={i} className="flex-1 items-center">
              <Text
                style={[systemFont, { fontSize: 13, fontWeight: '600', letterSpacing: -0.08, color: theme.weekdayText }]}
                allowFontScaling={true}
              >
                {day}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        style={{ backgroundColor: theme.background }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: MONTH_HEADER_HEIGHT + WEEKDAY_HEADER_HEIGHT, paddingBottom: 40 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {months.map((month, monthIndex) => {
          // Build weeks with proper alignment - add empty cells at the start
          const allCells: (Date | null)[] = [];

          // Add empty cells for days before month starts
          for (let i = 0; i < month.startWeekday; i++) {
            allCells.push(null);
          }

          // Add all actual days of the month
          allCells.push(...month.days);

          // Pad the last week to always have 7 cells for proper alignment
          const remainder = allCells.length % 7;
          if (remainder > 0) {
            for (let i = 0; i < 7 - remainder; i++) {
              allCells.push(null);
            }
          }

          // Split into weeks of 7
          const weeks: (Date | null)[][] = [];
          for (let i = 0; i < allCells.length; i += 7) {
            weeks.push(allCells.slice(i, i + 7));
          }

          return (
            <View key={format(month.date, "yyyy-MM")} style={{ paddingTop: monthIndex === 0 ? 8 : 24, paddingBottom: 16 }}>
              {/* Calendar Grid */}
              <View className="px-5">
                {/* Month abbreviation row - aligned to the column where 1st falls */}
                {monthIndex > 0 ? (
                  <View className="flex-row" style={{ height: 24, marginBottom: 4 }}>
                    {Array.from({ length: 7 }).map((_, colIndex) => (
                      <View key={colIndex} className="flex-1 items-center justify-center">
                        {colIndex === month.startWeekday ? (
                          <Text
                            style={[systemFont, { fontSize: 15, fontWeight: '700', letterSpacing: -0.3, color: theme.monthText }]}
                            allowFontScaling={true}
                          >
                            {format(month.date, "MMM")}
                          </Text>
                        ) : null}
                      </View>
                    ))}
                  </View>
                ) : null}
                {weeks.map((week, weekIndex) => (
                  <View key={weekIndex} className="flex-row" style={{ height: 64 }}>
                    {week.map((day, dayIndex) => {
                      if (!day) {
                        // Empty cell
                        return <View key={`empty-${dayIndex}`} className="flex-1" />;
                      }

                      const dateKey = format(day, "yyyy-MM-dd");
                      const dayEvents = eventsByDate[dateKey] || [];
                      const isTodayDate = isToday(day);

                      return (
                        <View key={dateKey} className="flex-1">
                          <Pressable
                            onPress={() => {
                              if (dayEvents.length > 0) {
                                handleDayPress(day);
                              }
                            }}
                            className="flex-1 items-center pt-1"
                          >
                            <View className="items-center w-full">
                              {/* Day number with background circle - Apple Calendar style */}
                              <View
                                style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: 18,
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  backgroundColor: isTodayDate ? theme.todayCircle : 'transparent',
                                }}
                              >
                                <Text
                                  style={[
                                    systemFont,
                                    {
                                      fontSize: 17,
                                      fontWeight: isTodayDate ? '600' : '400',
                                      letterSpacing: -0.4,
                                      color: isTodayDate ? theme.todayText : theme.dayText,
                                    }
                                  ]}
                                  allowFontScaling={true}
                                >
                                  {format(day, "d")}
                                </Text>
                              </View>

                              {/* Event indicator dots - individual colored dots per unique dance style */}
                              <View style={{ height: 16, justifyContent: 'flex-start', paddingTop: 2 }}>
                                {dayEvents.length > 0 && (
                                  <View className="flex-row" style={{ gap: 3 }}>
                                    {dayEvents.slice(0, 3).map((color, i) => (
                                      <View
                                        key={i}
                                        className="rounded-full"
                                        style={{
                                          width: 5,
                                          height: 5,
                                          backgroundColor: color
                                        }}
                                      />
                                    ))}
                                  </View>
                                )}
                              </View>
                            </View>
                          </Pressable>
                        </View>
                      );
                    })}
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
