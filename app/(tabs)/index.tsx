import { useClerk, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Button, FlatList, StyleSheet, Text, View } from "react-native";

const API_BASE = "http://localhost:8080";

type Event = {
  id: number;
  title: string;
  whenTime: string;
  wherePlace: string;
  description: string;
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
        const res = await fetch(`${API_BASE}/events`);
        const data = await res.json();
        setEvents(data);
      } catch (e) {
        console.error("Failed to fetch events", e);
      }
    };
    load();
  }, []);

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
        data={events}
        keyExtractor={e => e.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text>{item.whenTime}</Text>
            <Text>{item.wherePlace}</Text>
            {!!item.description && (
              <Text style={{ marginTop: 4 }}>{item.description}</Text>
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
