import React, { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { createEvent, fetchEvents } from "@/lib/api";
import { useUser as useClerkUser } from "@clerk/clerk-expo";
import { useUser as useAppUser } from "@/hooks/UserContext";

type Event = {
  id: number;
  title: string;
  location: string;
  description?: string;
  dietarySpecification?: string;
  availableFrom: string;
  availableUntil: string;
  status: string;
};

type AdminAnalytics = {
  totalEvents: number;
  activeEvents: number;
  expiredEvents: number;
  uniqueLocations: number;
  topLocations: { location: string; count: number }[];
  dietaryCounts: {
    vegan: number;
    vegetarian: number;
    glutenFree: number;
    nutFree: number;
  };
  timeBuckets: { label: string; count: number }[];
};

export default function AdminPost() {
  const { user: clerkUser } = useClerkUser();
  const { isAdmin } = useAppUser();

  if (!isAdmin) {
    return (
      <View style={styles.lockedContainer}>
        <Text style={styles.lockedTitle}>Admin access only</Text>
        <Text style={styles.lockedText}>
          This screen is only available to CUFF administrators. If you think you
          should have access, please contact the CUFF team.
        </Text>
      </View>
    );
  }

  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [dietarySpecification, setDietarySpecification] = useState("");

  // Dates are Date objects instead of strings
  const [availableFrom, setAvailableFrom] = useState<Date | null>(null);
  const [availableUntil, setAvailableUntil] = useState<Date | null>(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showUntilPicker, setShowUntilPicker] = useState(false);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [analytics, setAnalytics] = useState<AdminAnalytics>({
    totalEvents: 0,
    activeEvents: 0,
    expiredEvents: 0,
    uniqueLocations: 0,
    topLocations: [],
    dietaryCounts: {
      vegan: 0,
      vegetarian: 0,
      glutenFree: 0,
      nutFree: 0,
    },
    timeBuckets: [],
  });

  // Load analytics once
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const events: Event[] = await fetchEvents();
        const now = new Date();

        const totalEvents = events.length;
        const activeEvents = events.filter((e) => {
          const until = new Date(e.availableUntil);
          return (
            e.status?.toLowerCase() === "active" &&
            until.getTime() > now.getTime()
          );
        }).length;
        const expiredEvents = totalEvents - activeEvents;

        const uniqueLocations = new Set(events.map((e) => e.location)).size;

        // Top 3 locations by number of posts
        const locationCounts: Record<string, number> = {};
        events.forEach((e) => {
          const loc = e.location || "Unknown";
          locationCounts[loc] = (locationCounts[loc] || 0) + 1;
        });
        const topLocations = Object.entries(locationCounts)
          .map(([location, count]) => ({ location, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3);

        // Dietary counts
        let vegan = 0;
        let vegetarian = 0;
        let glutenFree = 0;
        let nutFree = 0;

        events.forEach((e) => {
          const text = (
            (e.description ?? "") + " " + (e.dietarySpecification ?? "")
          ).toLowerCase();
          if (text.includes("vegan")) vegan++;
          if (text.includes("vegetarian")) vegetarian++;
          if (text.includes("gluten-free") || text.includes("gluten free")) {
            glutenFree++;
          }
          if (text.includes("nut-free") || text.includes("nut free")) {
            nutFree++;
          }
        });

        // Time buckets based on availableFrom hour
        const buckets: { label: string; count: number }[] = [
          { label: "Morning (6–11am)", count: 0 },
          { label: "Midday (11am–2pm)", count: 0 },
          { label: "Afternoon (2–5pm)", count: 0 },
          { label: "Evening (5–9pm)", count: 0 },
          { label: "Late night (9pm–1am)", count: 0 },
        ];

        const bucketForHour = (hour: number) => {
          if (hour >= 6 && hour < 11) return 0;
          if (hour >= 11 && hour < 14) return 1;
          if (hour >= 14 && hour < 17) return 2;
          if (hour >= 17 && hour < 21) return 3;
          return 4;
        };

        events.forEach((e) => {
          const d = new Date(e.availableFrom);
          const idx = bucketForHour(d.getHours());
          buckets[idx].count += 1;
        });

        setAnalytics({
          totalEvents,
          activeEvents,
          expiredEvents,
          uniqueLocations,
          topLocations,
          dietaryCounts: { vegan, vegetarian, glutenFree, nutFree },
          timeBuckets: buckets,
        });
      } catch (e) {
        console.error("Failed to load admin analytics", e);
      }
    };

    loadAnalytics();
  }, []);

  const formatDateTime = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleString([], {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const toLocalIsoString = (date: Date): string => {
    const pad = (n: number) => n.toString().padStart(2, "0");

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1); // 0-based
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  };

  const pickFromLibrary = async () => {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "We need access to your photos to attach an image."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "We need camera access so you can take a picture."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
    Alert.alert("Missing title", "Please enter a title for the post.");
    return;
    }
    if (!availableFrom || !availableUntil) {
      Alert.alert(
        "Missing time",
        "Please pick both a start and end time for the event."
      );
      return;
    }

    setSubmitting(true);
    try {
      const availableFromIso = toLocalIsoString(availableFrom);
      const availableUntilIso = toLocalIsoString(availableUntil);

      const ADMIN_USER_ID = 1;

      await createEvent({
        title: title.trim(),
        location: location.trim(),
        description: description.trim(),
        dietarySpecification: dietarySpecification.trim(),
        availableFrom: availableFromIso,
        availableUntil: availableUntilIso,
        imageUrl: imageUri ?? undefined, // send URI as imageUrl
        userId: ADMIN_USER_ID,
      });

      Alert.alert("Success", "Post created successfully!");
      setTitle("");
      setLocation("");
      setDescription("");
      setDietarySpecification("");
      setAvailableFrom(null);
      setAvailableUntil(null);
      setImageUri(null);
    } catch (err: any) {
      console.error("Error creating event:", err);
      Alert.alert(
        "Error",
        err.message ?? "Something went wrong while creating the post."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.bigText}>Admin Dashboard</Text>
        <Text style={styles.subText}>
          Logged in as: {" "}
          {clerkUser?.primaryEmailAddress?.emailAddress ?? "Unknown"}
        </Text>

        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsTitle}>CUFF Analytics</Text>
          <Text>
            Total posts: {analytics.totalEvents} • Active:{" "}
            {analytics.activeEvents} • Expired: {analytics.expiredEvents}
          </Text>
          <Text>Unique locations used: {analytics.uniqueLocations}</Text>

          {analytics.topLocations.length > 0 && (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.analyticsSectionLabel}>Top locations</Text>
              {analytics.topLocations.map((loc) => (
                <Text key={loc.location}>
                  • {loc.location}: {loc.count} posts
                </Text>
              ))}
            </View>
          )}

          <View style={{ marginTop: 8 }}>
            <Text style={styles.analyticsSectionLabel}>Dietary options</Text>
            <Text>
              Vegan: {analytics.dietaryCounts.vegan} • Vegetarian:{" "}
              {analytics.dietaryCounts.vegetarian}
            </Text>
            <Text>
              Gluten-free: {analytics.dietaryCounts.glutenFree} • Nut-free:{" "}
              {analytics.dietaryCounts.nutFree}
            </Text>
          </View>

          <View style={{ marginTop: 8 }}>
            <Text style={styles.analyticsSectionLabel}>
              Common posting times
            </Text>
            {analytics.timeBuckets.map((b) => (
              <Text key={b.label}>
                • {b.label}: {b.count} events
              </Text>
            ))}
          </View>
        </View>

        <Text style={styles.formTitle}>Create Food Post</Text>
        <Text style={styles.formSubText}>
          Use the form below to publish a new leftover-food event and notify CUFF
          subscribers.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Title *"
          placeholderTextColor="#999"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={styles.input}
          placeholder="Location"
          placeholderTextColor="#999"
          value={location}
          onChangeText={setLocation}
        />
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Description"
          placeholderTextColor="#999"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <TextInput
          style={styles.input}
          placeholder="Dietary specification (e.g., 'vegan option, vegetarian, gluten-free, contains nutes')"
          placeholderTextColor="#999"
          value={dietarySpecification}
          onChangeText={setDietarySpecification}
        />
      
        <Text style={{ marginTop: 8, marginBottom: 4, fontWeight: "600" }}>
          Add a photo (optional)
        </Text>
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
          <View style={{ flex: 1 }}>
            <Button title="Take Photo" onPress={takePhoto} />
          </View>
          <View style={{ flex: 1 }}>
            <Button title="Choose from Library" onPress={pickFromLibrary} />
          </View>
        </View>

        {imageUri && (
         <View style={{ marginBottom: 12, alignItems: "center" }}>
            <Image
              source={{ uri: imageUri }}
              style={{ width: "100%", height: 180, borderRadius: 8 }}
              resizeMode="cover"
            />
            <Text style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
              This image will be attached to the event.
            </Text>
          </View>
        )}

        <Pressable
          style={styles.input}
          onPress={() => setShowFromPicker(true)}
        >
          <Text style={{ color: availableFrom ? "#000" : "#999" }}>
            {availableFrom
              ? `Available from: ${formatDateTime(availableFrom)}`
              : "Available from (tap to pick date & time)"}
          </Text>
        </Pressable>

        <Pressable
          style={styles.input}
          onPress={() => setShowUntilPicker(true)}
        >
          <Text style={{ color: availableUntil ? "#000" : "#999" }}>
            {availableUntil
              ? `Available until: ${formatDateTime(availableUntil)}`
              : "Available until (tap to pick date & time)"}
          </Text>
        </Pressable>

        {showFromPicker && (
          <DateTimePicker
            value={availableFrom || new Date()}
            mode="datetime"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_, date) => {
              setShowFromPicker(false);
              if (date) setAvailableFrom(date);
            }}
          />
        )}

        {showUntilPicker && (
          <DateTimePicker
            value={availableUntil || new Date()}
            mode="datetime"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_, date) => {
              setShowUntilPicker(false);
              if (date) setAvailableUntil(date);
            }}
          />
        )}

        <View style={{ marginTop: 16 }}>
          <Button
            title={submitting ? "Posting..." : "Post Food Event"}
            onPress={handleSubmit}
            disabled={submitting}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "#fff",
  },
  bigText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 16,
    textAlign: "center",
  },
  analyticsCard: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f3f6ff",
    borderWidth: 1,
    borderColor: "#c5d0f5",
  },
  analyticsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: "#00235D",
  },
  analyticsSectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 2,
    marginTop: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    color: "#000000",
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  lockedContainer: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  lockedTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  lockedText: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 8,
    marginBottom: 4,
    textAlign: "left",
  },
  formSubText: {
    fontSize: 13,
    color: "#555",
    marginBottom: 12,
  },
});