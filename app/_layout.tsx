/**
 * Root app layout for CUFF.
 * – Wires up Clerk auth, navigation theme, and UserContext
 * – Controls which route groups are accessible based on auth state
 */
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, usePathname, useRouter, useSegments } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { UserProvider } from "../hooks/UserContext";
import { colors } from "@/constants/theme";

// Keep splash screen visible until Clerk and routing are ready
SplashScreen.preventAutoHideAsync();

/**
 * Minimal key/value token cache for Clerk using expo-secure-store.
 * Stores the session token in encrypted device storage.
 */
const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch {
      return;
    }
  },
};

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error(
    "Missing Clerk Publishable Key. Did you forget to set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your env?"
  );
}

// Navigation theme aligned with CUFF brand colors
const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.cuBlue,
    background: colors.cuLightBlue,
    card: colors.cuNavy,
    text: colors.cuNavy,
    border: colors.cuBlue,
    notification: colors.cuBlue,
  }
}; 

// Standard Expo Router exports
export { ErrorBoundary } from "expo-router";
export const unstable_settings = { initialRouteName: "(tabs)" };

/**
 * Top-level layout responsible for:
 * – Hiding the splash screen when auth is ready
 * – Redirecting based on signed-in state and route group
 */
function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const pathname = usePathname();
  const segments = useSegments();
  const router = useRouter();

  // Hide splash screen once Clerk has initialized
  useEffect(() => {
    if (isLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isLoaded]);

  // Code auth-based routing logic
  useEffect(() => {
    if (!isLoaded || !pathname) return;

    // segments example: ["(tabs)", "admin"] or ["(auth)", "sign-in"]
    const rootSegment = segments[0] as string | undefined;

    const inTabsGroup = rootSegment === "(tabs)";
    const inAuthGroup = rootSegment === "(auth)";

    const authScreen = segments[1] as string | undefined;
    const isOnPublicAuthRoute =
      inAuthGroup &&
      ["sign-in", "sign-up", "forgot-password"].includes(authScreen ?? "");

    const isChangePasswordRoute = rootSegment === "change-password";

    if (isSignedIn && !inTabsGroup && !isChangePasswordRoute) {
      // Signed in but not in the main app area -> send to tabs
      router.replace("/(tabs)");
    } else if (!isSignedIn && !isOnPublicAuthRoute) {
      // Not signed in -> force to sign-in
      router.replace("/sign-in");
    }
  }, [isLoaded, isSignedIn, segments, pathname, router]);

  // Loading shell shown while Clerk initializes
  if (!isLoaded) {
    return (
      <View 
        style={{ 
          flex: 1, 
          justifyContent: "center", 
          alignItems: "center",
          padding: 24, 
        }}
      >
        <View
          style={{
            padding: 20,
            borderRadius: 12,
            backgroundColor: colors.white,
            alignItems: "center",
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
            elevation: 3,
          }}
        >
        <ActivityIndicator size="large" color={colors.cuBlue} />
        <Text 
          style={{ 
            marginTop: 12,
            fontSize: 16,
            fontWeight: "600",
            color: colors.cuNavy, 
          }}
        >
          Loading CUFF...
        </Text>
      </View>
    </View>
    );
  }

  // Once auth is ready, define the top-level navigator
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor : colors.cuNavy },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: "700" },
      }}
    > 
      {/* Main authenticated app (tabs: Dashboard, Preferences, Admin) */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      {/* Public auth flow (sign-in, sign-up, forgot-password) */}
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      {/* Generic modal route if needed */}
      <Stack.Screen name="modal" options={{ presentation: "modal" }}/>
      {/* Standalone change password screen (accessible while signed in) */}
      <Stack.Screen
        name="change-password"
        options={{
          presentation: "modal",
          headerShown: true,
          title: "Change Password",
          headerBackTitle: "Profile",
        }}
      />
    </Stack>
  );
};

/**
 * Root component for the app.
 * Wraps navigation in:
 * – UserProvider (app-level user + role)
 * - ClerkProvider (auth)
 * – ThemeProvider (navigation theming)
 */
export default function RootLayout() {
  return (
    <UserProvider>
      <ClerkProvider
        publishableKey={CLERK_PUBLISHABLE_KEY}
        tokenCache={tokenCache}
      >
        <ThemeProvider value={MyTheme}>
          <InitialLayout />
        </ThemeProvider>
      </ClerkProvider>
    </UserProvider>
  );
}