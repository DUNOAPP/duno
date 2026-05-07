import React from "react";
import { View, Text } from "react-native";
import { Music } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

export function DanceLogo() {
  return (
    <LinearGradient
      colors={["#007AFF", "#5856D6"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="w-8 h-8 rounded-lg items-center justify-center"
    >
      <Music size={18} color="white" strokeWidth={2.5} />
    </LinearGradient>
  );
}
