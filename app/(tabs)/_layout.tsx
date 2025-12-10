import React from "react";
import { Tabs } from "expo-router";
import { useUser as useAppUser } from "../../hooks/UserContext";
import { colors } from "@/constants/theme";
import { ActivityIndicator, View, Text } from "react-native";

export default function TabsLayout() {
  const { isAdmin, loading } = useAppUser();

  console.log("[TabsLayout] isAdmin =", isAdmin, "loading =", loading);

  if (loading) {
    // While we don't know yet, show a simple loading view
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Loading...</Text>
      </View>
    );
  }

  const commonOptions = {
    headerStyle: { backgroundColor: colors.cuNavy },
    headerTintColor: colors.white,
    headerTitleStyle: { fontWeight: "700" },
    tabBarStyle: { backgroundColor: colors.cuNavy },
    tabBarActiveTintColor: colors.cuBlue,
    tabBarInactiveTintColor: colors.cuLightGray,
  } as const;

  return (
    <Tabs screenOptions={commonOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
        }}
      />
      <Tabs.Screen
        name="preferences"
        options={{
          title: "Preferences",
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          title: "Admin Dashboard",
          // 👇 this is the key line:
          // when isAdmin is false, the admin tab is hidden from the tab bar
          href: isAdmin ? "/admin" : null,
        }}
      />
    </Tabs>
  );
}