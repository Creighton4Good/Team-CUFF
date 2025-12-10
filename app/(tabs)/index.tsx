import { useClerk, useUser as useClerkUser} from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { 
  Button, 
  FlatList, 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  ScrollView 
} from "react-native";
import { fetchEvents, deleteEvent } from "../../lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser as useAppUser } from "../../hooks/UserContext";
import { colors } from "@/constants/theme";

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
        console.log("[Home] raw events from backend", data);
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

    const isActive =
    !event.status || event.status.toLowerCase() === "active";

    if (!isActive) return false;

    if (!event.availableUntil) return true;

    if (!event.availableUntil) return true;

    const until = new Date(event.availableUntil);
    if (!Number.isFinite(until.getTime())) {
      console.log(
        "[Home] bad availableUntil for event",
        event.id,
        event.availableUntil
      );
      return true;
    }

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

  const filterSummary = 
    [
      prefs.avoidNuts && "no nuts",
      prefs.avoidGluten && "no gluten", 
      prefs.avoidDairy && "no dairy",
    ]
      .filter(Boolean)
      .join(", ") || "None";

  return (
    <View style={styles.screen}>
      <FlatList
        data={visibleEvents}
        keyExtractor={(e) => e.id.toString()}
        ListHeaderComponent={
          <View>
            {/* Header / hero */}
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>Available food on campus</Text>
                <Text style={styles.subtitle}>
                  Hello, {clerkUser?.firstName || "Bluejay"} – here’s what’s
                  currently up for grabs.
                </Text>
              </View>
            </View>

            {/* Stats row */}
            <View style={styles.statRow}>
              <View style={styles.statChip}>
                <Text style={styles.statLabel}>Total posts</Text>
                <Text style={styles.statValue}>{totalEvents}</Text>
              </View>
              <View style={styles.statChip}>
                <Text style={styles.statLabel}>Visible now</Text>
                <Text style={styles.statValue}>{activeEventsCount}</Text>
              </View>
              <View style={styles.statChip}>
                <Text style={styles.statLabel}>Locations</Text>
                <Text style={styles.statValue}>{uniqueLocations}</Text>
              </View>
            </View>

            {/* Filters + admin link */}
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Your filters</Text>
              <Text style={styles.infoText}>
                Notifications: <Text style={styles.infoTextStrong}>Set in Preferences</Text>
              </Text>
              <Text style={styles.infoText}>
                Hidden for: <Text style={styles.infoTextStrong}>{filterSummary}</Text>
              </Text>

              <Text style={styles.infoHint}>
                Adjust what you see on the Preferences tab.
              </Text>

              {isAdmin && (
                <View style={{ marginTop: 10 }}>
                  <Button
                    title="Go to Admin Dashboard"
                    onPress={() => router.push("/(tabs)/admin")}
                    color={colors.cuBlue}
                  />
                </View>
              )}
            </View>

            <Text style={styles.sectionTitle}>Available food events</Text>
          </View>
        }
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

              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{item.title}</Text>

                <Text style={styles.cardLocation}>📍 {item.location}</Text>
                <Text style={styles.cardTime}>
                  🕒 {formatRange(item.availableFrom, item.availableUntil)}
                </Text>

                {!!item.description && (
                  <Text style={styles.cardDescription}>
                    {item.description}
                  </Text>
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
                      color={colors.cuBlue}
                    />
                  </View>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No food posted yet</Text>
            <Text style={styles.emptyText}>
              When campus groups share leftover food, it will appear here in
              real time.
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 24 }}
      />

      <View style={styles.footer}>
        <Button title="Sign out" onPress={() => signOut()} color={colors.cuNavy} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  container: { flex: 1, padding: 20, backgroundColor: colors.cuLightBlue, },
  title: { 
    fontSize: 22, 
    fontWeight: "700", 
    color: colors.cuNavy, 
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#555",
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 12,
    gap: 8,
  },
  statChip: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.cuLightGray,
    backgroundColor: "#f6f8fc",
  },
  statLabel: {
    fontSize: 11,
    color: "#555",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.cuNavy,
  },
  infoCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#eef4ff",
    borderWidth: 1,
    borderColor: "#d1ddff",
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.cuNavy,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: "#333",
  },
  infoTextStrong: {
    fontWeight: "600",
  },
  infoHint: {
    fontSize: 11,
    color: "#666",
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 4,
    marginBottom: 8,
    paddingHorizontal: 20,
    color: colors.cuNavy,
  },
  card: {
    backgroundColor: colors.white,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e1e4ec",
    borderRadius: 12,
    marginHorizontal: 20,
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
    color: "#00235D", 
  },
  cardLocation: {
    fontSize: 14,
    color: "#333",
    marginBottom: 2,
  },
  cardTime: {
    fontSize: 13,
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
    borderColor: colors.cuBlue,
    backgroundColor: "#eef5ff",
  },
  badgeText: {
    fontSize: 11,
    color: colors.cuBlue,
    fontWeight: "500",
  },
  cardAdminRow: {
    marginTop: 10,
  },
  emptyCard: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e1e4ec",
    backgroundColor: "#fafbff",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.cuNavy,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 13,
    color: "#555",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#e1e4ec",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.white,
  },
});