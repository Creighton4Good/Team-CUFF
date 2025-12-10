import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, usePathname, useRouter, useSegments } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { UserProvider } from "../hooks/UserContext";
import { colors } from "@/constants/theme";

// This tells the splash screen to stay visible until we're ready
SplashScreen.preventAutoHideAsync();

/*
 * We need a secure place to store the user's session token.
 * `expo-secure-store` is perfect because it encrypts the data on the device.
 * This little object tells Clerk how to save and retrieve that token.
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

// These are just some nice-to-haves from Expo Router
export { ErrorBoundary } from "expo-router";
export const unstable_settings = { initialRouteName: "(tabs)" };

/**
 * This is our main layout component. It's the "bouncer" for our app,
 * deciding who gets to go where based on their login status.
 */
function InitialLayout() {
  // These hooks are our main tools from Clerk and Expo Router
  const { isLoaded, isSignedIn } = useAuth(); // Clerk's hook to check auth status
  const pathname = usePathname();
  const segments = useSegments(); // Expo Router's hook to know where the user is
  const router = useRouter(); // Expo Router's hook to navigate the user

  // This effect hides the splash screen once Clerk has loaded
  useEffect(() => {
    if (isLoaded) {
      SplashScreen.hideAsync();
    }
  }, [isLoaded]);

  // This is the core logic that handles our routing!
  useEffect(() => {
    if (!isLoaded || !pathname) return;

    // segments is like ["(tabs)", "admin"] or ["(auth)", "sign-in"]
    const rootSegment = segments[0] as string | undefined;

    const inTabsGroup = rootSegment === "(tabs)";
    const inAuthGroup = rootSegment === "(auth)";

    const authScreen = segments[1] as string | undefined;
    const isOnPublicAuthRoute =
      inAuthGroup &&
      ["sign-in", "sign-up", "forgot-password"].includes(authScreen ?? "");

    const isChangePasswordRoute = rootSegment === "change-password";

    if (isSignedIn && !inTabsGroup && !isChangePasswordRoute) {
      // Signed in but not in the main app area → send to tabs
      router.replace("/(tabs)");
    } else if (!isSignedIn && !isOnPublicAuthRoute) {
      // Not signed in → force to sign-in
      router.replace("/sign-in");
    }
  }, [isLoaded, isSignedIn, segments, pathname, router]);

  // While Clerk is loading, we'll show a simple loading spinner
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

  // Once loaded, we define our app's screens
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor : colors.cuNavy },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: "700" },
      }}
    > 
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: "modal" }}/>
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
 * This is the root component of our app.
 * We wrap everything in the `ClerkProvider` so that all our components
 * can access the user's authentication state.
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