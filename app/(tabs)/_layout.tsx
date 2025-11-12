import { useTheme } from "@react-navigation/native";
import { Tabs } from "expo-router";
export default function TabsLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTintColor: "#fff",
        tabBarStyle: { backgroundColor: colors.card },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#ddd",
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Dashboard" }} />
      <Tabs.Screen name="admin" options={{ title: "Post Event" }} />
    </Tabs>
  );
}