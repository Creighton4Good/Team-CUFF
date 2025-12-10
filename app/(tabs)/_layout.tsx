import React from "react";
import { Tabs } from "expo-router";
import { useUser } from "../../hooks/UserContext";
import { colors } from "@/constants/theme";

export default function TabsLayout() {
  const { loading, isAdmin } = useUser();

  console.log("[TabsLayout] loading, isAdmin =", loading, isAdmin);

  if (loading) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.cuNavy },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: "700" },
        tabBarStyle: { backgroundColor: colors.cuNavy },
        tabBarActiveTintColor: colors.cuBlue,
        tabBarInactiveTintColor: colors.cuLightGray,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ 
          title: "Dashboard",
          tabBarLabel: "Dashboard",
        }}
      />
      {isAdmin && <Tabs.Screen
        name="admin"
        options={{ 
          title: "Post Event",
          tabBarLabel: "Post Event",
          href: isAdmin ? undefined : null, 
        }}
      />}
      <Tabs.Screen
        name="preferences"
        options={{
        title: "Preferences",
        }}
      />
    </Tabs>
  );
}
