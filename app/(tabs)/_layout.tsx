/**
 * Tab layout for the main CUFF app.
 * Uses UserContext to optionally expose an admin-only tab.
 */

import React from "react";
import { Tabs } from "expo-router";
import { useUser as useAppUser } from "../../hooks/UserContext";
import { colors } from "@/constants/theme";
import { ActivityIndicator, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  // Read user role + loading state from app-level user context
  const { isAdmin, loading } = useAppUser();

  console.log("[TabsLayout] isAdmin =", isAdmin, "loading =", loading);

  // While user info is loading, block navigation behind a simple splash
  if (loading) {
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

  // Shared styling options for all tabs
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
      {/* Default tab: user-facing leftover food dashboard */}
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

      {/* User preferences for notifications and dietary filters */}
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

        {/* Admin-only tab, hidden when the user is not an admin */}
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
          // When isAdmin is false, this route is not accessible from the tab bar
          href: isAdmin ? "/admin" : null,
        }}
      />
    </Tabs>
  );
}