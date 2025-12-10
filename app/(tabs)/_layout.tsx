import React from "react";
import { Tabs } from "expo-router";
<<<<<<< HEAD
import { useUser } from "../../hooks/UserContext";
import { colors } from "@/constants/theme";

export default function TabsLayout() {
  const { loading, isAdmin } = useUser();

  console.log("[TabsLayout] loading, isAdmin =", loading, isAdmin);

  if (loading) {
    return null;
  }
=======

export default function TabsLayout() {
  const { colors } = useTheme();
>>>>>>> c89212a16b09248967b4a219865a45a3472a222d

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
<<<<<<< HEAD
          tabBarLabel: "Post Event",
          href: isAdmin ? undefined : null, 
        }}
      />}
      <Tabs.Screen
        name="preferences"
        options={{
        title: "Preferences",
=======
          tabBarLabel: "Post Event", 
>>>>>>> c89212a16b09248967b4a219865a45a3472a222d
        }}
      />
    </Tabs>
  );
}