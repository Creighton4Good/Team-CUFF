import { useClerk, useUser as useClerkUser} from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Button, FlatList, StyleSheet, Text, View, Image } from "react-native";
import { fetchEvents, deleteEvent } from "../../lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser as useAppUser } from "../../hooks/UserContext";

const PREFS_KEY = "cuff_preferences";

type Event = {
  id: number;
  title: string;
  location: string;
  description: string;
  dietarySpecification?: string;
  availableFrom: string;
  availableUntil: string;
  status: string;
  imageUrl?: string;
};

type Preferences = {
  highlightVeg: boolean;
  highlightVegan: boolean;
  avoidNuts: boolean;
  avoidGluten: boolean;
  avoidDairy: boolean;
}

export default function HomeScreen() {
  const { user: clerkUser } = useClerkUser();
  const router = useRouter();
  const { signOut } = useClerk();
  
  const { isAdmin, user: appUser } = useAppUser();

  const [events, setEvents] = useState<Event[]>([]);
  const [prefs, setPrefs] = useState<Preferences>({
    highlightVeg: false,
    highlightVegan: false,
    avoidNuts: false,
    avoidGluten: false,
    avoidDairy: false,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchEvents();
        setEvents(data);
      } catch (e) {
        console.error("Failed to fetch events", e);
      }

      try {
        const json = await AsyncStorage.getItem(PREFS_KEY);
        if (json) {
          setPrefs(JSON.parse(json) as Preferences);
        }
      } catch (e) {
        console.error("Failed to load prefs", e);
      }
    };
    load();
  }, []);

  const applyPrefs = (event: Event) => {
    const now = new Date();
    const until = new Date(event.availableUntil);

    // Only active + not expired
    if (event.status?.toLowerCase() !== "active") return false;
    if (until < now) return false;

    const text = (
      (event.description ?? "") +
      " " +
      (event.dietarySpecification ?? "")
    ).toLowerCase();

    const has = (keyword: string) => text.includes(keyword);

    // Gluten logic: allow “gluten-free” / "no gluten", hide anything else w/ "gluten"
    if (prefs.avoidGluten) {
      if (has("gluten-free") || has("no gluten")) {
        // safe — do nothing
      } else if (has("gluten")) {
        return false;
      }
    }

    // Dairy logic: allow "dairy-free" or vegan implies no dairy
    if (prefs.avoidDairy) {
      const safe =
        has("dairy-free") ||
        has("no dairy") ||
        has("vegan"); // vegan implies dairy-free
      if (!safe && (has("dairy") || has("cheese") || has("milk"))) {
        return false;
      }
    }

    // Nuts logic
    if (prefs.avoidNuts) {
      const safe = has("nut-free") || has("no nuts");
      if (!safe && has("nuts")) {
        return false;
      }
    }

    return true;
  };

  const visibleEvents = events
    .filter(applyPrefs)
    .sort(
      (a, b) =>
        new Date(a.availableFrom).getTime() -
        new Date(b.availableFrom).getTime()
    );

  const formatRange = (from: string, until: string) => {
    const start = new Date(from);
    const end = new Date(until);
    return `${start.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    })} – ${end.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    })}`;
  };

  const totalEvents = events.length;
  const activeEventsCount = visibleEvents.length;
  const uniqueLocations = new Set(events.map((e) => e.location)).size;

  const getHighlightBadges = (event: Event) => {
    const text = (
      (event.description ?? "") +
      " " +
      (event.dietarySpecification ?? "")
    ).toLowerCase();

    const badges: string[] = [];
    if (prefs.highlightVeg && text.includes("vegetarian")) {
      badges.push("Vegetarian option");
    }
    if (prefs.highlightVegan && text.includes("vegan")) {
      badges.push("Vegan option");
    }
    return badges;
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteEvent(id);
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (e) {
      console.error("Failed to delete event", e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back!</Text>
      <Text style={styles.userInfo}>
        Hello, {clerkUser?.firstName || "User"}!
      </Text>

      {isAdmin && (
        <Button
          title="Post an Event"
          onPress={() => router.push("/(tabs)/admin")}
        />
      )}

      <View style={{ marginBottom: 12 }}>
        <Text style={{ fontSize: 14 }}>
          Events: {totalEvents} • Visible (after filters): {activeEventsCount} •
          Locations: {uniqueLocations}
        </Text>
      </View>

      <View style={{ marginBottom: 8 }}>
        <Text style={{ fontSize: 13 }}>
          Notifications: {" "}
          {appUser?.notificationType ?? "Not set (update in Preferences)"}
        </Text>
        <Text style={{ fontSize: 13 }}>
          Filters active:{" "}
          {[
            prefs.avoidNuts && "No nuts",
            prefs.avoidGluten && "No gluten",
            prefs.avoidDairy && "No dairy",
          ]
            .filter(Boolean)
            .join(", ") || "none"}
        </Text>
      </View>

      <Text style={{ fontSize: 18, marginBottom: 8 }}>
        Available Food Events
      </Text>

      <FlatList
        data={visibleEvents}
        keyExtractor={(e) => e.id.toString()}
        renderItem={({ item }) => {
          const badges = getHighlightBadges(item);
          return (
            <View style={styles.card}>
              {item.imageUrl && (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
              )}
            
              <View style = {styles.cardBody}>
                <Text style={styles.cardTitle}>{item.title}</Text>

                <Text style={styles.cardLocation}>📍 {item.location}</Text>
                <Text style={styles.cardTime}>
                  🕒 {formatRange(item.availableFrom, item.availableUntil)}
                </Text>

                {!!item.description && (
                  <Text style={styles.cardDescription}>{item.description}</Text>
                )}
                {!!item.dietarySpecification && (
                <Text style={styles.cardDietary}>
                  Dietary: {item.dietarySpecification}
                </Text>
                )}

                {badges.length > 0 && (
                  <View style={styles.badgeRow}>
                    {badges.map((b) => (
                      <View key={b} style={styles.badge}>
                        <Text style={styles.badgeText}>{b}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {isAdmin && (
                  <View style={styles.cardAdminRow}>
                    <Button
                      title="Delete Event"
                      onPress={() => handleDelete(item.id)}
                    />
                  </View>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          totalEvents === 0 ? (
            <Text>No events have been posted yet.</Text>
          ) : (
            <Text>
              No events match your current filters. Try adjusting them in the
              Preferences tab.
            </Text>
          )
        }
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
    backgroundColor: "#ffffff",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardImage: {
    width: "100%",
    height: 160,
  },
  cardBody: {
    padding: 12,
  },
  cardTitle: { 
    fontSize: 17, 
    fontWeight: "700", 
    marginBottom: 4,
    color: "#00235D" 
  },
  cardLocation: {
    fontSize: 14,
    color: "#333",
    marginBottom: 6,
  },
  cardTime: {
    fontSize: 14,
    color: "#333",
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: "#222",
  },
  cardDietary: {
    fontSize: 13,
    color: "#444",
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#0b5ed7",
  },
  badgeText: {
    fontSize: 11,
    color: "#0b5ed7",
    fontWeight: "500",
  },
  cardAdminRow: {
    marginTop: 10,
  },
});