import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Switch, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PREFS_KEY = "cuff_preferences";

type Preferences = {
  highlightVeg: boolean;
  highlightVegan: boolean;
  avoidNuts: boolean;
  avoidGluten: boolean;
  avoidDairy: boolean;
};

export default function PreferencesScreen() {
  const [prefs, setPrefs] = useState<Preferences>({
    highlightVeg: false,
    highlightVegan: false,
    avoidNuts: false,
    avoidGluten: false,
    avoidDairy: false,
  });

  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const json = await AsyncStorage.getItem(PREFS_KEY);
        if (json) {
          setPrefs(JSON.parse(json) as Preferences);
        }
      } catch (e) {
        console.error("Failed to load preferences", e);
      }
    };
    loadPrefs();
  }, []);

  const update = async (partial: Partial<Preferences>) => {
    const next = { ...prefs, ...partial };
    setPrefs(next);
    try {
      await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(next));
    } catch (e) {
      console.error("Failed to save preferences", e);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Food & Notification Preferences</Text>
      <Text style={styles.subtitle}>
        These preferences control which events you see and how they’re
        highlighted on the Dashboard. Admins are encouraged to use phrases like
        “vegan option”, “vegetarian”, “gluten-free”, and “contains nuts” in the
        dietary notes.
      </Text>

      <Text style={styles.sectionHeader}>Highlight options I like</Text>

      <Row
        title="Highlight vegetarian-friendly events"
        description="Mark events that mention vegetarian options in their dietary notes."
        value={prefs.highlightVeg}
        onValueChange={(v) => update({ highlightVeg: v })}
      />

      <Row
        title="Highlight vegan-friendly events"
        description="Mark events that mention vegan options in their dietary notes."
        value={prefs.highlightVegan}
        onValueChange={(v) => update({ highlightVegan: v })}
      />

      <Text style={styles.sectionHeader}>Hide events with allergens I avoid</Text>

      <Row
        title="Avoid events that contain nuts"
        description='Hide events whose notes mention phrases like "contains nuts".'
        value={prefs.avoidNuts}
        onValueChange={(v) => update({ avoidNuts: v })}
      />

      <Row
        title="Avoid events that contain gluten"
        description='Hide events whose notes mention "gluten" or "contains gluten".'
        value={prefs.avoidGluten}
        onValueChange={(v) => update({ avoidGluten: v })}
      />

      <Row
        title="Avoid events that contain dairy"
        description='Hide events whose notes mention "contains dairy", "cheese", etc.'
        value={prefs.avoidDairy}
        onValueChange={(v) => update({ avoidDairy: v })}
      />
    </ScrollView>
  );
}

type RowProps = {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
};

function Row({ title, description, value, onValueChange }: RowProps) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionDescription}>{description}</Text>
      </View>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 8 },
  subtitle: { fontSize: 13, marginBottom: 20, color: "#444" },
  sectionHeader: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionTitle: { fontSize: 15, fontWeight: "500" },
  optionDescription: { fontSize: 12, color: "#666", marginTop: 4 },
});
