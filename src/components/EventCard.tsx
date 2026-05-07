import React from "react";
import { View, Text, Pressable } from "react-native";
import { format } from "date-fns";
import { MapPin, Clock } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    notes?: string | null;
    location?: string | null;
    startDate: string;
    endDate: string;
    allDay: boolean;
    danceStyles?: Array<{ id: string; name: string; color: string }>;
  };
  index: number;
  onPress: () => void;
}

export function EventCard({ event, index, onPress }: EventCardProps) {
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);

  const timeText = event.allDay
    ? "All day"
    : `${format(start, "h:mm a")} - ${format(end, "h:mm a")}`;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60)
        .springify()
        .damping(18)}
    >
      <Pressable
        onPress={onPress}
        className="flex-row bg-white rounded-2xl mb-2.5 overflow-hidden active:opacity-70"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 2,
        }}
      >
        <View
          className="w-1 rounded-l-2xl"
          style={{ backgroundColor: event.danceStyles?.[0]?.color ?? "#8E8E93" }}
        />
        <View className="flex-1 px-4 py-3.5">
          <Text
            className="text-base font-semibold text-gray-900"
            numberOfLines={1}
          >
            {event.title}
          </Text>
          <View className="flex-row items-center mt-1.5 gap-1.5">
            <Clock size={13} color="#9CA3AF" />
            <Text className="text-sm text-gray-500">{timeText}</Text>
          </View>
          {event.location ? (
            <View className="flex-row items-center mt-1 gap-1.5">
              <MapPin size={13} color="#9CA3AF" />
              <Text className="text-sm text-gray-400" numberOfLines={1}>
                {event.location}
              </Text>
            </View>
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}
