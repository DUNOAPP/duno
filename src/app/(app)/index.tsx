import React, { useCallback, useMemo, useState, useEffect } from "react";
import { View, Image, Text, Pressable, Platform } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { ContinuousCalendar } from "@/components/ContinuousCalendar";
import { FilterDropdown } from "@/components/FilterDropdown";
import { useCalendarStore } from "@/lib/state/calendar-store";
import { useThemeStore } from "@/lib/state/theme-store";
import { getTheme } from "@/lib/constants/theme";
import { api } from "@/lib/api/api";
import { UI_COLORS } from "@/lib/constants/colors";
import { useDanceStyles } from "@/lib/hooks/useDanceStyles";

const systemFont = Platform.select({
  ios: { fontFamily: "System" },
  default: {},
});

interface CalendarEvent {
  id: string;
  title: string;
  notes?: string | null;
  location?: string | null;
  venue?: string | null;
  danceStyles?: Array<{ id: string; name: string; color: string }>;
  city?: string | null;
  startDate: string;
  endDate: string;
  allDay: boolean;
}

const CITIES = [
  { label: "Barcelona", value: "Barcelona" },
  { label: "Budapest", value: "Budapest" },
  { label: "Cape Town", value: "Cape Town" },
  { label: "Castelldefels", value: "Castelldefels" },
  { label: "Cerdanyola del Vallès", value: "Cerdanyola del Vallès" },
  { label: "Madrid", value: "Madrid" },
  { label: "Sabadell", value: "Sabadell" },
  { label: "Terrassa", value: "Terrassa" },
];

export default function CalendarScreen() {
  const [minTimePassed, setMinTimePassed] = useState(false);

  // Start fetching data immediately during the landing page
  const { data: danceStylesData = [], isSuccess: stylesLoaded } = useDanceStyles();
  const { data: allEvents = [], isSuccess: eventsLoaded } = useQuery({
    queryKey: ["events-all"],
    queryFn: () => api.get<CalendarEvent[]>("/api/events"),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimePassed(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const dataReady = stylesLoaded && eventsLoaded && minTimePassed;

  if (!dataReady) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: "#FFFFFF" }}>
        <Image
          source={require("../../../assets/images/DUNO_logo_black.png")}
          style={{
            width: "65%",
            height: "65%",
            resizeMode: "contain",
          }}
        />
      </View>
    );
  }

  return (
    <CalendarContent
      allEvents={allEvents}
      danceStylesData={danceStylesData}
    />
  );
}

function DarkModeToggle() {
  const isDarkMode = useThemeStore((s) => s.isDarkMode);
  const toggleDarkMode = useThemeStore((s) => s.toggleDarkMode);

  // Same icon in both modes: white circle with black left half
  // Only the border color changes: black in light mode, white in dark mode
  const borderColor = isDarkMode ? "#FFFFFF" : "#000000";

  return (
    <View style={{ position: "absolute", right: 16, top: 0, bottom: 0, justifyContent: "center", zIndex: 200 }}>
      <Pressable
        onPress={toggleDarkMode}
        className="active:opacity-60"
        style={{
          width: 36,
          height: 36,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Svg width={28} height={28} viewBox="0 0 28 28">
          {/* White circle background */}
          <Circle cx={14} cy={14} r={12.5} fill="#FFFFFF" stroke={borderColor} strokeWidth={1.2} />
          {/* Black left half (semicircle) */}
          <Path
            d="M14,1.5 A12.5,12.5 0 0,0 14,26.5 Z"
            fill="#000000"
          />
        </Svg>
      </Pressable>
    </View>
  );
}

function CalendarContent({
  allEvents,
  danceStylesData,
}: {
  allEvents: CalendarEvent[];
  danceStylesData: Array<{ id: string; name: string; color: string }>;
}) {
  const setSelectedDate = useCalendarStore((s) => s.setSelectedDate);
  const danceStyle = useCalendarStore((s) => s.danceStyle);
  const setDanceStyle = useCalendarStore((s) => s.setDanceStyle);
  const city = useCalendarStore((s) => s.city);
  const setCity = useCalendarStore((s) => s.setCity);
  const isDarkMode = useThemeStore((s) => s.isDarkMode);
  const theme = getTheme(isDarkMode);

  const STYLE_ORDER = ["Salsa", "Bachata", "Kizomba"];
  const DANCE_STYLES = useMemo(() => [
    { label: "All Styles", value: "All Styles", color: UI_COLORS.allStyles },
    ...STYLE_ORDER
      .map((name) => danceStylesData.find((s) => s.name === name))
      .filter(Boolean)
      .map((s) => ({ label: s!.name, value: s!.name, color: s!.color })),
  ], [danceStylesData]);

  // Filter events locally based on selected filters
  const filteredEvents = useMemo(() => {
    return allEvents.filter((event) => {
      if (danceStyle !== "All Styles") {
        // Prefer structured danceStyles, fall back to legacy string
        let styleMatch = false;
        if (event.danceStyles && event.danceStyles.length > 0) {
          styleMatch = event.danceStyles.some(
            (ds) => ds.name.toLowerCase() === danceStyle.toLowerCase()
          );
        }
        if (!styleMatch) return false;
      }
      if (city !== "All Cities" && event.city !== city) return false;
      return true;
    });
  }, [allEvents, danceStyle, city]);

  const handleDayPress = useCallback(
    (date: Date) => {
      setSelectedDate(date);
      router.push({
        pathname: "/day" as any,
        params: {
          date: date.toISOString(),
          city: city,
          danceStyle: danceStyle,
        },
      });
    },
    [setSelectedDate, city, danceStyle]
  );

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }} edges={["top"]}>
        {/* Logo at top center + Settings button */}
        <View style={{ position: "relative", zIndex: 200 }} className="items-center py-1">
          <Image
            source={isDarkMode ? require("../../../assets/images/DUNO_logo_white.png") : require("../../../assets/images/DUNO_logo_black.png")}
            style={{
              width: 140,
              height: 56,
              resizeMode: "contain",
            }}
          />
          <DarkModeToggle />
        </View>

        {/* Filter Dropdowns */}
        <View className="px-5 pb-4 flex-row gap-3" style={{ zIndex: 100, backgroundColor: theme.background }}>
          <View className="flex-1" style={{ zIndex: 100 }}>
            <FilterDropdown
              label="City"
              value={city}
              options={CITIES}
              onSelect={(val) => setCity(val as any)}
            />
          </View>
          <View style={{ zIndex: 100 }}>
            <FilterDropdown
              label="Dance Style"
              value={danceStyle}
              options={DANCE_STYLES}
              onSelect={(val) => setDanceStyle(val as any)}
            />
          </View>
        </View>

        {/* Continuous Scrolling Calendar */}
        <ContinuousCalendar
          events={filteredEvents}
          onDayPress={handleDayPress}
          selectedDanceStyle={danceStyle}
        />
      </SafeAreaView>
    </View>
  );
}
