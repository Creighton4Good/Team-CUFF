/**
 * This layout file defines the navigation stack for all authentication-related screens,
 * such as Sign In, Sign Up, and Forgot Password.
 * Expo Router uses layouts like this one to automatically warap the screens
 * located in the same folder structure (here: app/(auth)/...).
 */

import { colors } from "@/constants/theme";
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        // Global header styling for all auth screens to ensure brand consistency
        headerStyle: { backgroundColor: colors.cuNavy },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: "700" },

        // The main screen background for all auth screens
        contentStyle: { backgroundColor: colors.white },
      }}
    >
      {/* Authentication screens – titles shown in header bar */}
      <Stack.Screen name="sign-in" options={{ title: "Sign In" }} />
      <Stack.Screen name="sign-up" options={{ title: "Create Account" }} />
      <Stack.Screen name="forgot-password" options={{ title: "Forgot Password" }} />
    </Stack>
  );
}