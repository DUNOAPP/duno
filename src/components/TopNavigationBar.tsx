import React, { useMemo } from "react";
import { View } from "react-native";
import { FilterDropdown } from "./FilterDropdown";
import { useCalendarStore } from "@/lib/state/calendar-store";
import { UI_COLORS } from "@/lib/constants/colors";
import { useDanceStyles } from "@/lib/hooks/useDanceStyles";

const CITIES = [
  { label: "All Cities", value: "All Cities" },
  { label: "Barcelona", value: "Barcelona" },
  { label: "Budapest", value: "Budapest" },
  { label: "Cape Town", value: "Cape Town" },
  { label: "Madrid", value: "Madrid" },
];

export function TopNavigationBar() {
  const city = useCalendarStore((s) => s.city);
  const setCity = useCalendarStore((s) => s.setCity);
  const danceStyle = useCalendarStore((s) => s.danceStyle);
  const setDanceStyle = useCalendarStore((s) => s.setDanceStyle);

  const { data: danceStylesData = [] } = useDanceStyles();
  const DANCE_STYLES = useMemo(() => [
    { label: "All Styles", value: "All Styles", color: UI_COLORS.allStyles },
    ...danceStylesData.map((s) => ({ label: s.name, value: s.name, color: s.color })),
  ], [danceStylesData]);

  return (
    <View className="bg-white">
      <View className="flex-row items-center px-4 pt-4 pb-3 gap-3">
        {/* Location Dropdown - Left */}
        <View className="flex-1">
          <FilterDropdown
            label="Location"
            value={city}
            options={CITIES}
            onSelect={(val) => setCity(val as any)}
            showIcon={true}
          />
        </View>

        {/* Dance Style Dropdown - Right */}
        <View className="flex-1">
          <FilterDropdown
            label="Dance Style"
            value={danceStyle}
            options={DANCE_STYLES}
            onSelect={(val) => setDanceStyle(val as any)}
            showIcon={false}
          />
        </View>
      </View>
    </View>
  );
}
