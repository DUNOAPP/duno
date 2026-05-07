import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { View } from "react-native";
import { useThemeStore } from "@/lib/state/theme-store";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const isDarkMode = useThemeStore((s) => s.isDarkMode);

  return (
    <View className="flex-1" onLayout={() => SplashScreen.hideAsync()}>
      <ThemeProvider value={isDarkMode ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: isDarkMode ? "black" : "white" },
          }}
        >
          <Stack.Screen name="(app)" />
        </Stack>
      </ThemeProvider>
    </View>
  );
}

export default function RootLayout() {
  const isDarkMode = useThemeStore((s) => s.isDarkMode);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider>
          <StatusBar style={isDarkMode ? "light" : "dark"} />
          <RootLayoutNav />
        </KeyboardProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
