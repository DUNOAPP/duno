import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format, addHours } from "date-fns";
import { X, Trash2 } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { api } from "@/lib/api/api";

interface CalendarEvent {
  id: string;
  title: string;
  notes?: string | null;
  location?: string | null;
  danceStyles?: Array<{ id: string; name: string; color: string }>;
  city?: string | null;
  startDate: string;
  endDate: string;
  allDay: boolean;
}

export default function EventScreen() {
  const { eventId, date } = useLocalSearchParams<{
    eventId?: string;
    date?: string;
  }>();
  const queryClient = useQueryClient();
  const isEditing = !!eventId;

  // Default start: round to next hour
  const defaultStart = date ? new Date(date) : new Date();
  if (!date) {
    defaultStart.setMinutes(0, 0, 0);
    defaultStart.setHours(defaultStart.getHours() + 1);
  }

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [location, setLocation] = useState("");
  const [danceStyle, setDanceStyle] = useState<"All" | "Salsa" | "Bachata" | "Kizomba">("All");
  const [city, setCity] = useState("");
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(addHours(defaultStart, 1));
  const [allDay, setAllDay] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Fetch existing event if editing
  const { data: existingEvent } = useQuery({
    queryKey: ["event", eventId, date],
    queryFn: async () => {
      if (!eventId) return null;
      const monthKey = format(new Date(date || new Date()), "yyyy-MM");
      const events = await api.get<CalendarEvent[]>(
        `/api/events?month=${monthKey}`
      );
      return events.find((e) => e.id === eventId) || null;
    },
    enabled: isEditing,
  });

  useEffect(() => {
    if (existingEvent) {
      setTitle(existingEvent.title);
      setNotes(existingEvent.notes || "");
      setLocation(existingEvent.location || "");
      const firstStyle = existingEvent.danceStyles?.[0]?.name || "All";
      setDanceStyle(firstStyle as any);
      setCity(existingEvent.city || "");
      setStartDate(new Date(existingEvent.startDate));
      setEndDate(new Date(existingEvent.endDate));
      setAllDay(existingEvent.allDay);
    }
  }, [existingEvent]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body = {
        title,
        notes: notes || undefined,
        location: location || undefined,
        city: city || undefined,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        allDay,
      };
      if (isEditing) {
        return api.put(`/api/events/${eventId}`, body);
      }
      return api.post("/api/events", body);
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ["events"] });
      router.back();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/api/events/${eventId}`),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ["events"] });
      router.back();
    },
  });

  const handleDelete = () => {
    Alert.alert("Delete Event", "Are you sure you want to delete this event?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteMutation.mutate(),
      },
    ]);
  };

  const canSave = title.trim().length > 0;

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={["top"]}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-3 border-b border-gray-100">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full active:bg-gray-100"
          >
            <X size={24} color="#6B7280" />
          </Pressable>
          <Text className="text-lg font-bold text-gray-900">
            {isEditing ? "Edit Event" : "New Event"}
          </Text>
          <Pressable
            onPress={() => saveMutation.mutate()}
            disabled={!canSave || saveMutation.isPending}
            className="px-4 py-2 rounded-full active:opacity-60"
          >
            {saveMutation.isPending ? (
              <ActivityIndicator size="small" color="#007AFF" />
            ) : (
              <Text
                className={`text-base font-semibold ${
                  canSave ? "text-blue-500" : "text-gray-300"
                }`}
              >
                Save
              </Text>
            )}
          </Pressable>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <Animated.View
            entering={FadeInDown.duration(300)}
            className="px-5 pt-5"
          >
            {/* Title */}
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Event title"
              placeholderTextColor="#D1D5DB"
              className="text-2xl font-bold text-gray-900 pb-4 border-b border-gray-100"
              autoFocus={!isEditing}
            />

            {/* Dance Style */}
            <View className="py-4 border-b border-gray-100">
              <Text className="text-sm font-medium text-gray-400 mb-3">
                Dance Style
              </Text>
              <View className="flex-row gap-2">
                {["All", "Salsa", "Bachata", "Kizomba"].map((style) => (
                  <Pressable
                    key={style}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setDanceStyle(style as any);
                    }}
                    className={`px-4 py-2 rounded-full border ${
                      danceStyle === style
                        ? "bg-blue-500 border-blue-500"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        danceStyle === style ? "text-white" : "text-gray-700"
                      }`}
                    >
                      {style}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* City */}
            <View className="py-4 border-b border-gray-100">
              <Text className="text-sm font-medium text-gray-400 mb-2">
                City
              </Text>
              <TextInput
                value={city}
                onChangeText={setCity}
                placeholder="Event city"
                placeholderTextColor="#D1D5DB"
                className="text-base text-gray-900"
              />
            </View>

            {/* All Day Toggle */}
            <View className="flex-row items-center justify-between py-4 border-b border-gray-100">
              <Text className="text-base text-gray-900">All Day</Text>
              <Switch
                value={allDay}
                onValueChange={setAllDay}
                trackColor={{ false: "#E5E7EB", true: "#007AFF" }}
                thumbColor="white"
              />
            </View>

            {/* Start Date */}
            <Pressable
              onPress={() => setShowStartPicker(!showStartPicker)}
              className="py-4 border-b border-gray-100"
            >
              <Text className="text-sm font-medium text-gray-400 mb-1">
                Starts
              </Text>
              <Text className="text-base text-gray-900">
                {allDay
                  ? format(startDate, "EEEE, MMMM d, yyyy")
                  : format(startDate, "EEEE, MMMM d, yyyy 'at' h:mm a")}
              </Text>
            </Pressable>
            {showStartPicker ? (
              <View className="py-2">
                <DateTimePicker
                  value={startDate}
                  mode={allDay ? "date" : "datetime"}
                  display="spinner"
                  onChange={(_, selectedDate) => {
                    if (selectedDate) {
                      setStartDate(selectedDate);
                      if (selectedDate >= endDate) {
                        setEndDate(addHours(selectedDate, 1));
                      }
                    }
                  }}
                  textColor="#111827"
                />
              </View>
            ) : null}

            {/* End Date */}
            <Pressable
              onPress={() => setShowEndPicker(!showEndPicker)}
              className="py-4 border-b border-gray-100"
            >
              <Text className="text-sm font-medium text-gray-400 mb-1">
                Ends
              </Text>
              <Text className="text-base text-gray-900">
                {allDay
                  ? format(endDate, "EEEE, MMMM d, yyyy")
                  : format(endDate, "EEEE, MMMM d, yyyy 'at' h:mm a")}
              </Text>
            </Pressable>
            {showEndPicker ? (
              <View className="py-2">
                <DateTimePicker
                  value={endDate}
                  mode={allDay ? "date" : "datetime"}
                  display="spinner"
                  minimumDate={startDate}
                  onChange={(_, selectedDate) => {
                    if (selectedDate) setEndDate(selectedDate);
                  }}
                  textColor="#111827"
                />
              </View>
            ) : null}

            {/* Location */}
            <View className="py-4 border-b border-gray-100">
              <Text className="text-sm font-medium text-gray-400 mb-2">
                Location
              </Text>
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="Add location"
                placeholderTextColor="#D1D5DB"
                className="text-base text-gray-900"
              />
            </View>

            {/* Notes */}
            <View className="py-4 border-b border-gray-100">
              <Text className="text-sm font-medium text-gray-400 mb-2">
                Notes
              </Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Add notes"
                placeholderTextColor="#D1D5DB"
                multiline
                numberOfLines={4}
                className="text-base text-gray-900 min-h-[80px]"
                textAlignVertical="top"
              />
            </View>

            {/* Delete Button (only when editing) */}
            {isEditing ? (
              <Pressable
                onPress={handleDelete}
                className="flex-row items-center justify-center gap-2 py-4 mt-4 mb-10"
              >
                <Trash2 size={18} color="#EF4444" />
                <Text className="text-red-500 font-semibold text-base">
                  Delete Event
                </Text>
              </Pressable>
            ) : null}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
