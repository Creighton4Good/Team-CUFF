import React, { useState } from "react";
import { Alert, Button, ScrollView, StyleSheet, Text, TextInput } from "react-native";

// IMPORTANT: Use your computer's LAN IP when testing on a real device.
// For iOS simulator, http://localhost:8080 is fine.
// Example: const API_BASE = "http://192.168.1.10:8080";
const API_BASE = "http://localhost:8080";

export default function AdminPost() {
  const [title, setTitle] = useState("");
  const [when, setWhen] = useState("");
  const [where, setWhere] = useState("");
  const [desc, setDesc] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!title || !when || !where) {
      Alert.alert("Missing fields", "Please fill in title, time, and location.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          when,
          where,
          description: desc,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      Alert.alert("Event posted", "Your leftover food event has been posted.");
      setTitle("");
      setWhen("");
      setWhere("");
      setDesc("");
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Could not post event. Check your connection / server.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Post a Food Event</Text>

      <TextInput
        placeholder="Event title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      <TextInput
        placeholder="When (time window)"
        value={when}
        onChangeText={setWhen}
        style={styles.input}
      />
      <TextInput
        placeholder="Where (building, room)"
        value={where}
        onChangeText={setWhere}
        style={styles.input}
      />
      <TextInput
        placeholder="Optional description"
        value={desc}
        onChangeText={setDesc}
        style={[styles.input, styles.multiline]}
        multiline
      />

      <Button title={busy ? "Posting..." : "Post Event"} onPress={submit} disabled={busy} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 6,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },
});
