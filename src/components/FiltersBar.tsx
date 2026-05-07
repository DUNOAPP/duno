import React from "react";
import { View } from "react-native";
import { FilterDropdown } from "./FilterDropdown";
import { useCalendarStore } from "@/lib/state/calendar-store";

const DANCE_STYLES = [
  { label: "All Styles", value: "All Styles" },
  { label: "Bachata", value: "Bachata" },
  { label: "Kizomba", value: "Kizomba" },
  { label: "Salsa", value: "Salsa" },
];

const CITIES = [
  { label: "All Cities", value: "All Cities" },
  { label: "Barcelona", value: "Barcelona" },
  { label: "Budapest", value: "Budapest" },
  { label: "Cape Town", value: "Cape Town" },
  { label: "Madrid", value: "Madrid" },
];

export function FiltersBar() {
  const danceStyle = useCalendarStore((s) => s.danceStyle);
  const city = useCalendarStore((s) => s.city);
  const setDanceStyle = useCalendarStore((s) => s.setDanceStyle);
  const setCity = useCalendarStore((s) => s.setCity);

  return (
    <View className="px-5 py-3 bg-white border-b border-gray-100 gap-3 flex-row">
      <FilterDropdown
        label="Dance Style"
        value={danceStyle}
        options={DANCE_STYLES}
        onSelect={(val) => setDanceStyle(val as any)}
      />
      <FilterDropdown
        label="City"
        value={city}
        options={CITIES}
        onSelect={(val) => setCity(val as any)}
      />
    </View>
  );
}
