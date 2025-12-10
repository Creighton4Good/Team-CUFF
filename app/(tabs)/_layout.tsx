import React from "react";
import { Tabs } from "expo-router";
import { useUser as useAppUser } from "../../hooks/UserContext";
import { colors } from "@/constants/theme";
import { ActivityIndicator, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  const { isAdmin, loading } = useAppUser();

  console.log("[TabsLayout] isAdmin =", isAdmin, "loading =", loading);

  if (loading) {
    // While we don't know yet, show a simple loading view
    return (
      <View 
        style={{ 
          flex: 1, 
          backgroundColor: colors.cuNavy,
          justifyContent: "center", 
          alignItems: "center" 
        }}
      >
        <ActivityIndicator size="large" color={colors.cuBlue} />
        <Text 
          style={{ 
            marginTop: 8,
            color: colors.white,
            fontWeight: "600", 
          }}
        >
          Loading your CUFF account...
        </Text>
      </View>
    );
  }

  const commonOptions = {
    headerStyle: { backgroundColor: colors.cuNavy },
    headerTintColor: colors.white,
    headerTitleStyle: { fontWeight: "700" },
    tabBarStyle: { 
      backgroundColor: colors.cuNavy,
      borderTopColor: colors.cuLightGray, 
    },
    tabBarActiveTintColor: colors.cuBlue,
    tabBarInactiveTintColor: colors.cuLightGray,
    tabBarLabelStyle: {
      fontSize: 11,
      fontWeight: "600",
    },
  } as const;

  return (
    <Tabs screenOptions={commonOptions}>

      <Tabs.Screen
        name="index"
        options={{
          title: "Available Food",
          tabBarLabel: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size ?? 22} />
          ),
        }}
      />

      <Tabs.Screen
        name="preferences"
        options={{
          title: "Preferences",
          tabBarLabel: "Preferences",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="options-outline" color={color} size={size ?? 22} />
          ),
        }}
      />

      <Tabs.Screen
        name="admin"
        options={{
          title: "Admin Dashboard",
          tabBarLabel: "Admin",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="create-outline"
              color={color}
              size={size ?? 22}
            />
          ),
          // when isAdmin is false, the admin tab is hidden from the tab bar
          href: isAdmin ? "/admin" : null,
        }}
      />
    </Tabs>
  );
}