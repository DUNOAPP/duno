import React, { useMemo, useState } from "react";
import { View, Text, Pressable, Platform, useWindowDimensions, ScrollView, Image, Share } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import Svg, { Path } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { format } from "date-fns";
import { DANCE_STYLE_COLORS_FALLBACK } from "@/lib/constants/colors";
import { useDanceStyles, buildStyleColorMap } from "@/lib/hooks/useDanceStyles";
import { useThemeStore } from "@/lib/state/theme-store";
import { getTheme } from "@/lib/constants/theme";

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

function IOSShareIcon({ size = 24, color = "#fff", strokeWidth = 2 }: { size?: number; color?: string; strokeWidth?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Arrow pointing up - protrudes above the rectangle */}
      <Path
        d="M12 15V1M12 1L7 6M12 1L17 6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Open-top rounded rectangle */}
      <Path
        d="M7 10H5.5C4.67 10 4 10.67 4 11.5V20.5C4 21.33 4.67 22 5.5 22H18.5C19.33 22 20 21.33 20 20.5V11.5C20 10.67 19.33 10 18.5 10H17"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PosterImage({ uri, screenWidth }: { uri: string; screenWidth: number }) {
  const [aspectRatio, setAspectRatio] = useState(1);

  React.useEffect(() => {
    Image.getSize(uri, (w, h) => {
      if (w && h) setAspectRatio(w / h);
    });
  }, [uri]);

  const imageHeight = screenWidth / aspectRatio;

  return (
    <View className="mt-6 -mx-5">
      <Image
        source={{ uri }}
        style={{ width: screenWidth, height: imageHeight }}
        resizeMode="contain"
      />
    </View>
  );
}

export default function EventDetailScreen() {
  const { eventData } = useLocalSearchParams<{
    eventData: string;
  }>();
  const { width } = useWindowDimensions();

  const isDarkMode = useThemeStore((s) => s.isDarkMode);
  const theme = getTheme(isDarkMode);

  const { data: danceStylesData = [] } = useDanceStyles();
  const styleColorMap = useMemo(() => {
    const apiMap = buildStyleColorMap(danceStylesData);
    return { ...DANCE_STYLE_COLORS_FALLBACK, ...apiMap };
  }, [danceStylesData]);

  let event: CalendarEvent | null = null;

  if (eventData) {
    try {
      event = JSON.parse(eventData);
    } catch (error) {
      console.error("Failed to parse event data:", error);
    }
  }

  // Calculate responsive font size based on screen width
  const calculateFontSize = (titleLength: number, screenWidth: number) => {
    // More aggressive font sizing to ensure text fits
    if (titleLength <= 12) return 44;
    if (titleLength <= 20) return 36;
    if (titleLength <= 30) return 28;
    if (titleLength <= 50) return 24;
    return 20;
  };

  const titleFontSize = event ? calculateFontSize(event.title.length, width) : 34;

  const ALLOWED_TAGS = ["Salsa", "Bachata", "Kizomba"];

  // Get dance styles from structured data or fall back to parsing string
  const eventDanceStyles = event
    ? (event.danceStyles && event.danceStyles.length > 0)
      ? event.danceStyles.map((ds) => ds.name).filter((name) => ALLOWED_TAGS.includes(name))
      : []
    : [];

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <SafeAreaView className="flex-1" style={{ backgroundColor: theme.background }} edges={["top"]}>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
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

            {/* Share button - absolute right */}
            <Pressable
              onPress={() => {
                if (event) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Share.share({
                    message: [
                      event.title,
                      event.startDate ? format(new Date(event.startDate), "MMMM d, yyyy") : null,
                      event.venue ?? event.location ?? null,
                    ]
                      .filter(Boolean)
                      .join("\n"),
                  });
                }
              }}
              className="active:opacity-60"
              style={{ position: 'absolute', right: 16, top: 0, bottom: 0, zIndex: 10, justifyContent: 'center' }}
            >
              <IOSShareIcon size={24} strokeWidth={2.2} color={theme.shareIcon} />
            </Pressable>
          </View>

          {/* Event title */}
          {event ? (
            <View className="px-5 pt-4">
              <Text
                style={[systemFont, { fontSize: titleFontSize, fontWeight: "700", color: theme.text }]}
                allowFontScaling={false}
              >
                {event.title}
              </Text>

              {/* Space reserved for future attendee count */}
              <View className="h-2 mt-3" />

              {/* Dance style badges */}
              {eventDanceStyles.length > 0 ? (
                <View className="flex-row flex-wrap gap-2 mt-3">
                  {eventDanceStyles.map((style, i) => (
                    <View
                      key={i}
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 8,
                        backgroundColor: styleColorMap[style] || "#8E8E93",
                      }}
                    >
                      <Text
                        style={[systemFont, { fontSize: 13, fontWeight: "600", color: "#FFFFFF" }]}
                        allowFontScaling={true}
                      >
                        {style}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {/* Divider line */}
              <View style={{ height: 1, backgroundColor: theme.separator, marginTop: 24 }} />

              {/* Date & Time section */}
              <View className="mt-6">
                <Text
                  style={[systemFont, { fontSize: 16, fontWeight: "600", color: theme.text }]}
                  allowFontScaling={true}
                >
                  {format(new Date(event.startDate), "EEE, d MMM")}
                </Text>
                <Text
                  style={[systemFont, { fontSize: 15, color: theme.textSecondary }]}
                  className="mt-1"
                  allowFontScaling={true}
                >
                  {format(new Date(event.startDate), "HH:mm")}
                  {event.endDate ? ` - ${format(new Date(event.endDate), "HH:mm")}` : null}
                </Text>
              </View>

              {/* Divider line before venue */}
              <View style={{ height: 1, backgroundColor: theme.separator, marginTop: 24 }} />

              {/* Venue section */}
              {event.venue || event.location ? (
                <View className="mt-6">
                  {event.venue ? (
                    <Text
                      style={[systemFont, { fontSize: 16, fontWeight: "500", color: theme.text }]}
                      className="mt-1"
                      allowFontScaling={true}
                      selectable={true}
                    >
                      {event.venue}
                    </Text>
                  ) : null}
                  {event.location ? (
                    <Text
                      style={[systemFont, { fontSize: 14, color: theme.textSecondary }]}
                      className="mt-0.5"
                      allowFontScaling={true}
                      selectable={true}
                    >
                      {event.location}
                    </Text>
                  ) : null}
                </View>
              ) : null}

              {/* Divider line before poster if poster exists */}
              {event.posterUrl ? (
                <View style={{ height: 1, backgroundColor: theme.separator, marginTop: 24 }} />
              ) : null}

              {/* Poster section */}
              {event.posterUrl ? (
                <PosterImage uri={event.posterUrl} screenWidth={width} />
              ) : null}

              {/* Divider line before promoters if poster exists */}
              {event.posterUrl ? (
                <View style={{ height: 1, backgroundColor: theme.separator, marginTop: 24 }} />
              ) : null}

              {/* Promoters section placeholder */}
              {/* To be implemented in future */}

              {/* Bottom padding */}
              <View className="h-12" />
            </View>
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text style={[systemFont, { fontSize: 17, color: theme.textSecondary }]}>
                Event not found
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
