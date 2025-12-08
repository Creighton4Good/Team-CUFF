import React, { useState } from "react";
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
import { createEvent } from "@/lib/api";
import { useUser } from "@clerk/clerk-expo";

export default function AdminPost() {
  const { user } = useUser();

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

  const formatDateTime = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleString([], {
      dateStyle: "short",
      timeStyle: "short",
    });
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
      const availableFromIso = availableFrom.toISOString().slice(0, 19);
      const availableUntilIso = availableUntil.toISOString().slice(0, 19);

      await createEvent({
        title: title.trim(),
        location: location.trim(),
        description: description.trim(),
        dietarySpecification: dietarySpecification.trim(),
        availableFrom: availableFromIso,
        availableUntil: availableUntilIso,
        imageUrl: imageUri ?? undefined, // send URI as imageUrl
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