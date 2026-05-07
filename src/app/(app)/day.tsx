import React, { useMemo, useState } from "react";
import { View, Text, Pressable, Platform, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { format, isSameDay, isToday, addDays } from "date-fns";
import * as Haptics from "expo-haptics";
import { ChevronLeft } from "lucide-react-native";
import { api } from "@/lib/api/api";
import { DANCE_STYLE_COLORS_FALLBACK } from "@/lib/constants/colors";
import { useDanceStyles, buildStyleColorMap } from "@/lib/hooks/useDanceStyles";
import { useThemeStore } from "@/lib/state/theme-store";
import { getTheme } from "@/lib/constants/theme";
import { MiniCalendarOverlay } from "@/components/MiniCalendarOverlay";

// Use SF Pro system font on iOS for Apple Calendar style
const systemFont = Platform.select({
  ios: { fontFamily: "System" },
  default: {},
});

interface CalendarEvent {
  id: string;
  title: string;
  notes?: string | null;
  description?: string | null;
  location?: string | null;
  venue?: string | null;
  danceStyles?: Array<{ id: string; name: string; color: string }>;
  city?: string | null;
  startDate: string;
  endDate: string;
  allDay: boolean;
  posterUrl?: string | null;
}

export default function DayScreen() {
  const { date, city, danceStyle } = useLocalSearchParams<{
    date: string;
    city: string;
    danceStyle: string;
  }>();

  const [viewingDate, setViewingDate] = useState<Date>(
    () => date ? new Date(date) : new Date()
  );
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const selectedCity = city || "All Cities";
  const selectedDanceStyle = danceStyle || "All Styles";

  const isDarkMode = useThemeStore((s) => s.isDarkMode);
  const theme = getTheme(isDarkMode);

  const { data: danceStylesData = [] } = useDanceStyles();
  const styleColorMap = useMemo(() => {
    const apiMap = buildStyleColorMap(danceStylesData);
    return { ...DANCE_STYLE_COLORS_FALLBACK, ...apiMap };
  }, [danceStylesData]);

  const getStyleColor = (style: string): string => {
    const normalized = style.charAt(0).toUpperCase() + style.slice(1).toLowerCase();
    return styleColorMap[normalized] || styleColorMap[style] || "#8E8E93";
  };

  // Fetch all events
  const { data: allEvents = [] } = useQuery({
    queryKey: ["events-all"],
    queryFn: () => api.get<CalendarEvent[]>("/api/events"),
    staleTime: 5 * 60 * 1000,
  });

  // Filter events for the selected day with same filters as calendar
  const dayEvents = allEvents.filter((event) => {
    // Match the selected date
    if (!isSameDay(new Date(event.startDate), viewingDate)) return false;

    // Apply city filter
    if (selectedCity !== "All Cities" && event.city !== selectedCity)
      return false;

    // Apply dance style filter - prefer structured data, fall back to string
    if (selectedDanceStyle !== "All Styles") {
      let hasMatch = false;
      if (event.danceStyles && event.danceStyles.length > 0) {
        hasMatch = event.danceStyles.some(
          (ds) => ds.name.toLowerCase() === selectedDanceStyle.toLowerCase()
        );
      }
      if (!hasMatch) return false;
    }

    return true;
  });

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }} edges={["top"]}>
        {/* Header with back button and logo */}
        <View style={{ position: 'relative' }} className="py-1">
          {/* Back button - absolute left */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
            className="flex-row items-center active:opacity-60"
            style={{ position: 'absolute', left: 0, top: 0, bottom: 0, zIndex: 10, paddingLeft: 4, justifyContent: 'center' }}
          >
            <ChevronLeft size={28} color={theme.backIcon} />
          </Pressable>

          {/* Logo at top center */}
          <View className="items-center">
            <Image
              source={isDarkMode ? require("../../../assets/images/DUNO_logo_white.png") : require("../../../assets/images/DUNO_logo_black.png")}
              style={{
                width: 140,
                height: 56,
                resizeMode: "contain",
              }}
            />
          </View>
        </View>

        {/* Day info pills - Date and City */}
        <View className="px-5 pb-4 flex-row gap-3" style={{ backgroundColor: theme.background, zIndex: isCalendarOpen ? 10000 : 1 }}>
          {/* Date pill - tappable to open mini calendar */}
          <View style={{ position: "relative", zIndex: isCalendarOpen ? 10000 : 1, minWidth: 100 }}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setIsCalendarOpen(!isCalendarOpen);
              }}
              className="active:opacity-60"
            >
              <View className="px-4 py-2.5 rounded-full flex-row items-center justify-center" style={{ backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#000000" }}>
                <Text
                  style={[systemFont, { fontSize: 15, fontWeight: "600", color: "#000000" }]}
                  allowFontScaling={true}
                  numberOfLines={1}
                >
                  {isToday(viewingDate) ? "Today" : isSameDay(viewingDate, addDays(new Date(), 1)) ? "Tomorrow" : format(viewingDate, "EEE, d MMM")}
                </Text>
              </View>
            </Pressable>

            {/* Mini Calendar Overlay */}
            {isCalendarOpen ? (
              <MiniCalendarOverlay
                selectedDate={viewingDate}
                onSelectDate={(newDate) => {
                  setViewingDate(newDate);
                  setIsCalendarOpen(false);
                }}
                onDismiss={() => setIsCalendarOpen(false)}
              />
            ) : null}
          </View>

          {/* City pill */}
          <View style={{ flex: 1, minWidth: 0 }}>
            <View className="px-4 py-2.5 rounded-full flex-row items-center justify-center" style={{ backgroundColor: theme.cityPillBg, borderWidth: 1, borderColor: theme.cityPillBorder }}>
              <Text
                style={[systemFont, { fontSize: 15, fontWeight: "600", color: theme.cityPillText }]}
                allowFontScaling={true}
                numberOfLines={1}
              >
                {selectedCity}
              </Text>
            </View>
          </View>
        </View>

        {/* Events list */}
        <ScrollView className="flex-1 px-5 pt-4">
          {dayEvents.length === 0 ? (
            <View className="flex-1 items-center justify-center py-20">
              <Text
                style={[systemFont, { fontSize: 17, fontWeight: "400", color: theme.textSecondary }]}
                className="text-center px-6"
                allowFontScaling={true}
              >
                Ups! Nothing happening here… yet! Try another date.
              </Text>
            </View>
          ) : (
            dayEvents.map((event, index) => {
              const ALLOWED_TAGS = ["Salsa", "Bachata", "Kizomba"];
              // Prefer structured danceStyles, fall back to parsing string
              const eventStyles = (event.danceStyles && event.danceStyles.length > 0)
                ? event.danceStyles.map((ds) => ds.name).filter((name) => ALLOWED_TAGS.includes(name))
                : [];

              return (
                <View key={event.id}>
                  <Pressable
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      router.push({
                        pathname: "/(app)/event-detail",
                        params: { eventData: JSON.stringify(event) },
                      });
                    }}
                    className="active:opacity-60"
                  >
                    <View className="flex-row py-4">
                      {/* Colored left border - multiple colors if multiple dance styles */}
                      <View className="flex-row" style={{ marginRight: 12 }}>
                        {eventStyles.length === 0 ? (
                          <View
                            style={{
                              width: 6,
                              borderRadius: 3,
                              backgroundColor: getStyleColor("Salsa"),
                            }}
                          />
                        ) : (
                          eventStyles.map((style, i) => (
                            <View
                              key={i}
                              style={{
                                width: 5,
                                borderRadius: 2.5,
                                backgroundColor: getStyleColor(style),
                              }}
                            />
                          ))
                        )}
                      </View>

                      {/* Card content */}
                      <View className="flex-1">
                        {/* Event title */}
                        <Text
                          style={[systemFont, { fontSize: 16, fontWeight: "600", color: theme.text }]}
                          allowFontScaling={true}
                        >
                          {event.title}
                        </Text>

                        {/* Time range */}
                        <Text
                          style={[systemFont, { fontSize: 14, color: theme.textSecondary }]}
                          className="mt-1"
                          allowFontScaling={true}
                        >
                          {format(new Date(event.startDate), "HH:mm")}
                          {event.endDate ? ` – ${format(new Date(event.endDate), "HH:mm")}` : null}
                        </Text>

                        {/* Venue */}
                        {event.venue || event.location ? (
                          <Text
                            style={[systemFont, { fontSize: 14, color: theme.textTertiary }]}
                            className="mt-0.5"
                            allowFontScaling={true}
                          >
                            {event.venue || event.location}
                          </Text>
                        ) : null}

                        {/* Dance style label */}
                        {eventStyles.length > 0 ? (
                          <Text
                            style={[systemFont, { fontSize: 12, color: theme.textTertiary }]}
                            className="mt-1"
                            allowFontScaling={true}
                          >
                            {eventStyles.join(", ")}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  </Pressable>

                  {/* Separator line between cards */}
                  {index < dayEvents.length - 1 && (
                    <View style={{ height: 1, backgroundColor: theme.separator, marginLeft: 16 }} />
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
