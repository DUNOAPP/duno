import React, { useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { OtpInput } from "react-native-otp-entry";
import { ArrowLeft } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { authClient } from "@/lib/auth/auth-client";
import { useInvalidateSession } from "@/lib/auth/use-session";

export default function VerifyOTP() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const invalidateSession = useInvalidateSession();

  const handleVerifyOTP = async (otp: string) => {
    setLoading(true);
    setError(null);

    const result = await authClient.signIn.emailOtp({
      email: email!.trim(),
      otp,
    });

    setLoading(false);

    if (result.error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(result.error.message || "Invalid code");
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await invalidateSession();
    }
  };

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={["top"]}>
        <Pressable
          onPress={() => router.back()}
          className="ml-4 mt-2 w-10 h-10 items-center justify-center rounded-full active:bg-gray-100"
        >
          <ArrowLeft size={24} color="#111827" />
        </Pressable>

        <Animated.View
          entering={FadeInDown.duration(400).springify()}
          className="flex-1 px-8 pt-12"
        >
          <Text className="text-2xl font-bold text-gray-900 tracking-tight">
            Enter verification code
          </Text>
          <Text className="text-base text-gray-400 mt-2 mb-10">
            We sent a 6-digit code to {email}
          </Text>

          <OtpInput
            numberOfDigits={6}
            onFilled={handleVerifyOTP}
            type="numeric"
            focusColor="#007AFF"
            theme={{
              containerStyle: { gap: 10 },
              pinCodeContainerStyle: {
                borderWidth: 1.5,
                borderColor: "#E5E7EB",
                borderRadius: 16,
                width: 48,
                height: 56,
                backgroundColor: "#F9FAFB",
              },
              pinCodeTextStyle: {
                fontSize: 22,
                fontWeight: "600",
                color: "#111827",
              },
              focusedPinCodeContainerStyle: {
                borderColor: "#007AFF",
                backgroundColor: "#EFF6FF",
              },
            }}
          />

          {error ? (
            <Text className="text-sm text-red-500 mt-4 text-center">
              {error}
            </Text>
          ) : null}

          {loading ? (
            <ActivityIndicator className="mt-6" color="#007AFF" />
          ) : null}
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}
