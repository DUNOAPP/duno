import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { authClient } from "@/lib/auth/auth-client";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError(null);

    const result = await authClient.emailOtp.sendVerificationOtp({
      email: email.trim().toLowerCase(),
      type: "sign-in",
    });

    setLoading(false);

    if (result.error) {
      setError(result.error.message || "Failed to send code");
    } else {
      router.push({
        pathname: "/verify-otp" as any,
        params: { email: email.trim().toLowerCase() },
      });
    }
  };

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView className="flex-1" edges={["top"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 px-8 justify-center"
        >
          <Animated.View entering={FadeInDown.duration(500).springify()}>
            <View className="items-center mb-10">
              <View
                className="w-20 h-20 rounded-3xl bg-blue-500 items-center justify-center mb-5"
                style={{
                  shadowColor: "#007AFF",
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                }}
              >
                <Calendar size={40} color="white" strokeWidth={1.8} />
              </View>
              <Text className="text-3xl font-bold text-gray-900 tracking-tight">
                Calendar
              </Text>
              <Text className="text-base text-gray-400 mt-2">
                Sign in to manage your schedule
              </Text>
            </View>

            <View className="gap-4">
              <View>
                <Text className="text-sm font-medium text-gray-500 mb-2 ml-1">
                  Email address
                </Text>
                <TextInput
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor="#D1D5DB"
                  className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-base text-gray-900"
                  onSubmitEditing={handleSendOTP}
                  returnKeyType="go"
                />
              </View>

              {error ? (
                <Text className="text-sm text-red-500 ml-1">{error}</Text>
              ) : null}

              <Pressable
                onPress={handleSendOTP}
                disabled={loading || !email.trim()}
                className={`rounded-2xl py-4 items-center mt-2 ${
                  loading || !email.trim()
                    ? "bg-blue-300"
                    : "bg-blue-500 active:bg-blue-600"
                }`}
                style={{
                  shadowColor: "#007AFF",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 12,
                }}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-base font-semibold">
                    Continue
                  </Text>
                )}
              </Pressable>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
