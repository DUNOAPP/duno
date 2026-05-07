import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/api";

export interface DanceStyle {
  id: string;
  name: string;
  color: string;
}

export function useDanceStyles() {
  return useQuery({
    queryKey: ["dance-styles"],
    queryFn: () => api.get<DanceStyle[]>("/api/dance-styles"),
    staleTime: 30 * 60 * 1000,
  });
}

export function buildStyleColorMap(styles: DanceStyle[]): Record<string, string> {
  const map: Record<string, string> = {};
  styles.forEach((s) => {
    map[s.name] = s.color;
  });
  return map;
}
