import React, { useState } from "react";
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { createEvent } from "@/lib/api";
import { useUser } from "@clerk/clerk-expo";

export default function AdminPost() {
  const { user } = useUser();
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [dietarySpecification, setDietarySpecification] = useState("");
  const [availableFrom, setAvailableFrom] = useState("");
  const [availableUntil, setAvailableUntil] = useState("");
  const [submitting, setSubmitting] = useState(false);

  console.log("AdminPost screen rendered");

  const handleSubmit = async () => {
    if (!title.trim()) {
    Alert.alert("Missing title", "Please enter a title for the post.");
    return;
    }

    const userId = 1; // still hard-coded for now

    setSubmitting(true);
    try {
      const availableFromIso = toIsoOrUndefined(availableFrom);
      const availableUntilIso = toIsoOrUndefined(availableUntil);

      if (!availableFromIso || !availableUntilIso) {
        Alert.alert(
          "Missing time",
          "Please enter both start and end times in the format 2025-12-07T18:00:00."
        );
        setSubmitting(false);
        return;
      }

      await createEvent({
        title: title.trim(),
        location: location.trim(),
        description: description.trim(),
        dietarySpecification: dietarySpecification.trim(),
        availableFrom: availableFromIso,
        availableUntil: availableUntilIso,
      });

      Alert.alert("Success", "Post created successfully!");
      setTitle("");
      setLocation("");
      setDescription("");
      setDietarySpecification("");
      setAvailableFrom("");
      setAvailableUntil("");
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

  const toIsoOrUndefined = (value: string): string | undefined => {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  // If the user already typed something ISO-like, just send it through.
  if (trimmed.includes("T")) {
    return trimmed;
  }

  // Try to parse more casual formats like "12/7/2025 18:00"
  const parsed = new Date(trimmed);
  if (isNaN(parsed.getTime())) {
    throw new Error(
      'Could not understand date/time. Please use format like "2025-12-07T18:00:00".'
    );
  }

  return parsed.toISOString().slice(0, 19); // "YYYY-MM-DDTHH:mm:ss"
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.bigText}>Create Food Post</Text>
      <Text style={styles.subText}>
        Logged in as: {user?.primaryEmailAddress?.emailAddress ?? "Unknown"}
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
      <TextInput
        style={styles.input}
        placeholder='Available from (e.g. 2025-12-07T18:00:00)'
        placeholderTextColor="#999"
        value={availableFrom}
        onChangeText={setAvailableFrom}
      />
      <TextInput
        style={styles.input}
        placeholder='Available until (e.g. 2025-12-07T20:00:00)'
        placeholderTextColor="#999"
        value={availableUntil}
        onChangeText={setAvailableUntil}
      />

      <View style={{ marginTop: 16 }}>
        <Button
          title={submitting ? "Posting..." : "Post Food Event"}
          onPress={handleSubmit}
          disabled={submitting}
        />
      </View>
    </ScrollView>
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
});
