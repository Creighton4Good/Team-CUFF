import { useClerk, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Button, FlatList, StyleSheet, Text, View } from "react-native";
import { fetchEvents } from "../../lib/api";

const API_BASE = "http://localhost:8080";

type Event = {
  id: number;
  title: string;
  location: string;
  description: string;
  dietarySpecification?: string;
  availableFrom: string;
  availableUntil: string;
  status: string;
};

export default function HomeScreen() {
  const { user } = useUser();
  const router = useRouter();
  const { signOut } = useClerk();
  const isAdmin = user?.publicMetadata?.role === "admin";

  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchEvents();
        console.log("Events from API (dashboard):", data);
        setEvents(data);
      } catch (e) {
        console.error("Failed to fetch events", e);
      }
    };
    load();
  }, []);

  const visibleEvents = events.filter((e) => {
    const now = new Date();
    const until = new Date(e.availableUntil);
    return e.status?.toLowerCase() === "active" && until >= now;
  });

  const formatRange = (from: string, until: string) => {
    const start = new Date(from);
    const end = new Date(until);
    return `${start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} – ${end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back!</Text>
      <Text style={styles.userInfo}>
        Hello, {user?.firstName || "User"}!
      </Text>

      {isAdmin && (
        <Button
          title="Post an Event"
          onPress={() => router.push("/(tabs)/admin")}
        />
      )}

      <View style={styles.separator} />

      <Text style={{ fontSize: 18, marginBottom: 8 }}>Available Food Events</Text>
      <FlatList
        data={visibleEvents}
        keyExtractor={(e) => e.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text>{item.location}</Text>
            <Text>{formatRange(item.availableFrom, item.availableUntil)}</Text>
            {!!item.description && (
              <Text style={{ marginTop: 4 }}>{item.description}</Text>
            )}
            {!!item.dietarySpecification && (
              <Text style={{ marginTop: 4 }}>
                Dietary: {item.dietarySpecification}
              </Text>
            )}
          </View>
        )}
        ListEmptyComponent={<Text>No events yet.</Text>}
      />

      <View style={styles.separator} />
      <Button title="Sign Out" onPress={() => signOut()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  userInfo: { fontSize: 18, marginBottom: 10 },
  separator: {
    marginVertical: 20,
    height: 1,
    width: "100%",
    backgroundColor: "#eee",
  },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  cardTitle: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
});
