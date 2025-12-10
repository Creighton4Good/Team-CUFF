/**
 * CUFF Admin dashboard screen.
 * – Shows lightweight analytics about past events
 * – Lets admins create new leftover food posts with time window + photo
 */

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
import { useNavigation } from "expo-router";
import { colors } from "@/constants/theme";

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
  // Identity + role: Clerk user for display, app user for admin gating
  const { user: clerkUser } = useClerkUser();
  const { isAdmin } = useAppUser();
  const navigation = useNavigation();

  console.log(
    "[AdminPost] isAdmin =", 
    isAdmin, 
    "email =", 
    clerkUser?.primaryEmailAddress?.emailAddress
  );

  // Configure the header when this screen mounts
  useEffect(() => {
    navigation.setOptions({
      title: "Admin Dashboard",
      headerTitle: "Admin Dashboard",
    });
  }, [navigation]);
  
  // Form fields for new event
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [dietarySpecification, setDietarySpecification] = useState("");

  // Availability window as Date objects (converted to string for API)
  const [availableFrom, setAvailableFrom] = useState<Date | null>(null);
  const [availableUntil, setAvailableUntil] = useState<Date | null>(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showUntilPicker, setShowUntilPicker] = useState(false);

  // Optional image attached to the event
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Basic analytics snapshot built from existing events
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

  // Load analytics once on mount
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const events: Event[] = await fetchEvents();
        const now = new Date();

        const totalEvents = events.length;
        const activeEvents = events.filter((e) => {
          const now = new Date();

          // Treat missing status as active (same as HomeScreen)
          const isStatusActive =
            !e.status || e.status.toLowerCase() === "active";

          if (!isStatusActive) return false;

          // If no end time, assume it's still active
          if (!e.availableUntil) return true;

          const until = new Date(e.availableUntil);

          // If we can't parse the date, fail open and treat as active
          if (!Number.isFinite(until.getTime())) {
            console.log(
              "[Admin] bad availableUntil for event",
              e.id,
              e.availableUntil
            );
            return true;
          }

          // Active if it ends in the future
          return until.getTime() > now.getTime();
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

        // Dietary counts inferred from description + dietarySpecification
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

        // Group events by time of day they were posted (availableFrom)
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

  // Format a Date for human-readable UI labels
  const formatDateTime = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleString([], {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  /**
   * Convert a Date to a local ISO string (no timezone suffix)
   * to match what the backend expects.
   */
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

  // Image selection from gallery
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

  // Take a photo with the camera
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

  // Validate form + submit new event to backend
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

      // TODO: replace hard-coded userId once backend is wired to Creighton MFA
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

  // Non-admins are blocked with a simple message instead of the dashboard
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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#f5f7fb" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* HEADER / IDENTITY */}
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>CUFF Admin Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            Signed in as{" "}
            <Text style={styles.headerEmail}>
              {clerkUser?.primaryEmailAddress?.emailAddress ?? "Unknown user"}
            </Text>
          </Text>
          <Text style={styles.headerHint}>
            Create new leftover food posts and review basic usage patterns.
          </Text>
        </View>

        {/* ANALYTICS OVERVIEW */}
        <View style={styles.analyticsCard}>
          <Text style={styles.sectionLabel}>At a glance</Text>
          <View style={styles.analyticsRow}>
            <View style={styles.analyticsStat}>
              <Text style={styles.analyticsStatLabel}>Total posts</Text>
              <Text style={styles.analyticsStatValue}>
                {analytics.totalEvents}
              </Text>
            </View>
            <View style={styles.analyticsStat}>
              <Text style={styles.analyticsStatLabel}>Active</Text>
              <Text style={styles.analyticsStatValue}>
                {analytics.activeEvents}
              </Text>
            </View>
            <View style={styles.analyticsStat}>
              <Text style={styles.analyticsStatLabel}>Locations</Text>
              <Text style={styles.analyticsStatValue}>
                {analytics.uniqueLocations}
              </Text>
            </View>
          </View>

          {analytics.topLocations.length > 0 && (
            <View style={styles.analyticsSection}>
              <Text style={styles.analyticsSectionTitle}>Top locations</Text>
              {analytics.topLocations.map((loc) => (
                <Text key={loc.location} style={styles.analyticsBodyText}>
                  • {loc.location}: {loc.count} posts
                </Text>
              ))}
            </View>
          )}

          <View style={styles.analyticsSection}>
            <Text style={styles.analyticsSectionTitle}>Dietary options</Text>
            <Text style={styles.analyticsBodyText}>
              Vegan: {analytics.dietaryCounts.vegan} • Vegetarian:{" "}
              {analytics.dietaryCounts.vegetarian}
            </Text>
            <Text style={styles.analyticsBodyText}>
              Gluten-free: {analytics.dietaryCounts.glutenFree} • Nut-free:{" "}
              {analytics.dietaryCounts.nutFree}
            </Text>
          </View>

          <View style={styles.analyticsSection}>
            <Text style={styles.analyticsSectionTitle}>
              Common posting times
            </Text>
            {analytics.timeBuckets.map((b) => (
              <Text key={b.label} style={styles.analyticsBodyText}>
                • {b.label}: {b.count} events
              </Text>
            ))}
          </View>
        </View>

        {/* FORM TITLE */}
        <Text style={styles.formTitle}>Create food post</Text>
        <Text style={styles.formSubText}>
          Share leftover food on campus so students can find it before it’s
          gone.
        </Text>

        {/* FORM FIELDS */}
        <TextInput
          style={styles.input}
          placeholder="Title *"
          placeholderTextColor="#999"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={styles.input}
          placeholder="Location (building, room, or area)"
          placeholderTextColor="#999"
          value={location}
          onChangeText={setLocation}
        />
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Description (what food is available, who can take it, etc.)"
          placeholderTextColor="#999"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <TextInput
          style={styles.input}
          placeholder="Dietary notes (e.g., 'vegan option, vegetarian, gluten-free, contains nuts')"
          placeholderTextColor="#999"
          value={dietarySpecification}
          onChangeText={setDietarySpecification}
        />

        {/* IMAGE PICKER */}
        <Text style={styles.smallSectionLabel}>Add a photo (optional)</Text>
        <View style={styles.photoRow}>
          <View style={{ flex: 1 }}>
            <Button title="Take Photo" onPress={takePhoto} />
          </View>
          <View style={{ flex: 1 }}>
            <Button title="Choose from Library" onPress={pickFromLibrary} />
          </View>
        </View>

        {imageUri && (
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: imageUri }}
              style={styles.imagePreview}
              resizeMode="cover"
            />
            <Text style={styles.imageCaption}>
              This image will be attached to the event.
            </Text>
          </View>
        )}

        {/* TIME PICKERS */}
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

        {/* SUBMIT BUTTON */}
        <Pressable
          style={[
            styles.primaryButton,
            submitting && { opacity: 0.7 },
          ]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.primaryButtonText}>
            {submitting ? "Posting…" : "Post food event"}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "#f5f7fb",
  },

  // Header / identity
  headerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#dde5f5",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.cuNavy,
    marginBottom: 4,
    textAlign: "left",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  headerEmail: {
    fontWeight: "600",
    color: colors.cuBlue,
  },
  headerHint: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },

  // Analytics
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.cuNavy,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  analyticsCard: {
    marginBottom: 20,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#E9F2FB",
    borderWidth: 1,
    borderColor: "#c5d0f5",
  },
  analyticsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  analyticsStat: {
    flex: 1,
    marginRight: 8,
  },
  analyticsStatLabel: {
    fontSize: 12,
    color: "#445",
    marginBottom: 2,
  },
  analyticsStatValue: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.cuNavy,
  },
  analyticsSection: {
    marginTop: 8,
  },
  analyticsSectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
    color: colors.cuNavy,
  },
  analyticsBodyText: {
    fontSize: 12,
    color: "#444",
    marginBottom: 2,
  },

  // Form
  formTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 4,
    marginBottom: 4,
    color: colors.cuNavy,
  },
  formSubText: {
    fontSize: 13,
    color: "#555",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d0d4e4",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    color: "#000000",
    backgroundColor: "#ffffff",
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },

  smallSectionLabel: {
    marginTop: 8,
    marginBottom: 4,
    fontWeight: "600",
    fontSize: 13,
    color: colors.cuNavy,
  },
  photoRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  imagePreviewContainer: {
    marginBottom: 12,
    alignItems: "center",
  },
  imagePreview: {
    width: "100%",
    height: 180,
    borderRadius: 8,
  },
  imageCaption: {
    fontSize: 12,
    color: "#555",
    marginTop: 4,
  },

  // Primary button
  primaryButton: {
    marginTop: 16,
    backgroundColor: colors.cuBlue,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 16,
  },

  // Locked (non-admin)
  lockedContainer: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f7fb",
  },
  lockedTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    color: colors.cuNavy,
  },
  lockedText: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
  },
});