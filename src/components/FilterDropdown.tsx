import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, Platform } from "react-native";
import { MapPin, ChevronDown } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useThemeStore } from "@/lib/state/theme-store";
import { getTheme } from "@/lib/constants/theme";

// Use SF Pro system font on iOS for Apple Calendar style
const systemFont = Platform.select({
  ios: { fontFamily: "System" },
  default: {},
});

interface FilterOption {
  label: string;
  value: string;
  color?: string;
}

interface FilterDropdownProps {
  label: string;
  value: string;
  options: FilterOption[];
  onSelect: (value: string) => void;
  showIcon?: boolean;
}

export function FilterDropdown({
  label,
  value,
  options,
  onSelect,
  showIcon = false,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);
  const isDarkMode = useThemeStore((s) => s.isDarkMode);
  const theme = getTheme(isDarkMode);

  const handleSelect = (val: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(val);
    setIsOpen(false);
  };

  if (showIcon) {
    return (
      <View style={{ position: "relative" }}>
        <Pressable
          onPress={() => setIsOpen(!isOpen)}
          className="flex-row items-center gap-2 active:opacity-60"
        >
          <MapPin size={20} color="#6B7280" />
          <Text className="text-base font-semibold text-gray-900">
            {selectedOption?.label || label}
          </Text>
          <ChevronDown size={20} color="#9CA3AF" />
        </Pressable>

        {isOpen ? (
          <View
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              marginTop: 8,
              zIndex: 999,
              minWidth: 200,
            }}
            className="bg-white border border-gray-200 rounded-xl"
          >
            <ScrollView scrollEnabled={options.length > 5} nestedScrollEnabled={true} style={{ maxHeight: 300 }}>
              {options.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => handleSelect(option.value)}
                  className={`px-4 py-3 flex-row items-center gap-2 border-b border-gray-100 active:bg-blue-50 ${
                    value === option.value ? "bg-blue-50" : ""
                  }`}
                >
                  <MapPin size={16} color="#6B7280" />
                  <Text
                    className={`text-sm ${
                      value === option.value
                        ? "text-blue-500 font-semibold"
                        : "text-gray-700"
                    }`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}
      </View>
    );
  }

  // Check if a specific style is selected (not "All Styles" or "All Cities")
  const hasColorDot = selectedOption?.color && !selectedOption.value.startsWith("All");

  // Simplified inline style for text-only - Apple Calendar style
  return (
    <View style={{ position: "relative", zIndex: isOpen ? 10000 : 1 }}>
      <Pressable
        onPress={() => setIsOpen(!isOpen)}
        style={{
          paddingHorizontal: 16,
          paddingVertical: 10,
          backgroundColor: theme.filterPillBg,
          borderRadius: 9999,
          flexDirection: "row",
          alignItems: "center",
        }}
        className="active:opacity-60"
      >
        <ChevronDown size={14} color={theme.chevronColor} style={{ marginRight: 4 }} />
        {/* Colored dot for selected dance style */}
        {hasColorDot ? (
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: selectedOption.color,
              marginRight: 6,
            }}
          />
        ) : null}
        <Text
          style={[systemFont, { fontSize: 15, fontWeight: "600", color: theme.filterPillText }]}
          allowFontScaling={true}
        >
          {selectedOption?.label || label}
        </Text>
      </Pressable>

      {isOpen ? (
        <View
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: 8,
            zIndex: 10000,
            minWidth: 180,
            elevation: 10,
            borderRadius: 14,
            overflow: "hidden",
            backgroundColor: theme.dropdownBg,
            borderWidth: isDarkMode ? 0 : 1,
            borderColor: theme.dropdownBorder,
          }}
        >
          <ScrollView scrollEnabled={options.length > 5} nestedScrollEnabled={true} style={{ maxHeight: 300 }}>
            {options.map((option, index) => {
              const hasColorDot = option.color && !option.value.startsWith("All");
              return (
                <Pressable
                  key={option.value}
                  onPress={() => handleSelect(option.value)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderBottomWidth: index < options.length - 1 ? 0.5 : 0,
                    borderBottomColor: theme.dropdownBorder,
                    backgroundColor: value === option.value ? theme.dropdownSelectedBg : "transparent",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  {/* Colored dot for dance style options */}
                  {hasColorDot ? (
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: option.color,
                        marginRight: 8,
                      }}
                    />
                  ) : null}
                  <Text
                    style={[systemFont, {
                      fontSize: 15,
                      fontWeight: value === option.value ? "600" : "400",
                      color: value === option.value ? theme.dropdownText : theme.dropdownTextDim,
                    }]}
                    allowFontScaling={true}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}
