import React from "react";
import { useTheme } from "@react-navigation/native";
import { Tabs } from "expo-router";
import { useUser } from "../../hooks/UserContext";

export default function TabsLayout() {
  const { colors } = useTheme();
  const { loading, isAdmin } = useUser();

  console.log("[TabsLayout] loading, isAdmin =", loading, isAdmin);

  if (loading) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: "#fff",
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#cce0ff",
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ 
          title: "Dashboard",
          tabBarLabel: "Dashboard",
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{ 
          title: "Post Event",
          tabBarLabel: "Post Event",
          href: isAdmin ? undefined : null, 
        }}
      />
      <Tabs.Screen
        name="preferences"
        options={{
        title: "Preferences",
        }}
      />
    </Tabs>
  );
}
