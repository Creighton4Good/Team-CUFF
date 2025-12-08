import React, { useEffect, useState } from "react";
import { 
    View, 
    Text, 
    StyleSheet, 
    Switch, 
    ScrollView, 
    Pressable 
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PREFS_KEY = "cuff_preferences";

type Preferences = {
  highlightVeg: boolean;
  highlightVegan: boolean;
  avoidNuts: boolean;
  avoidGluten: boolean;
  avoidDairy: boolean;
};

const NOTIFICATION_OPTIONS = ["None", "Email", "SMS", "Both"] as const;
type NotificationType = (typeof NOTIFICATION_OPTIONS)[number];

type StoredPrefs = Preferences & { notificationType: NotificationType };

export default function PreferencesScreen() {
  const [prefs, setPrefs] = useState<Preferences>({
    highlightVeg: false,
    highlightVegan: false,
    avoidNuts: false,
    avoidGluten: false,
    avoidDairy: false,
  });
  const [notificationType, setNotificationType] =
    useState<NotificationType>("Both");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const json = await AsyncStorage.getItem(PREFS_KEY);
        if (json) {
          const stored = JSON.parse(json) as Partial<StoredPrefs>;
          setPrefs({
            highlightVeg: !!stored.highlightVeg,
            highlightVegan: !!stored.highlightVegan,
            avoidNuts: !!stored.avoidNuts,
            avoidGluten: !!stored.avoidGluten,
            avoidDairy: !!stored.avoidDairy,
          });
          if (
            stored.notificationType &&
            NOTIFICATION_OPTIONS.includes(stored.notificationType as any)
          ) {
            setNotificationType(stored.notificationType as NotificationType);
          }
        }
      } catch (e) {
        console.error("Failed to load preferences", e);
      } finally {
        setLoading(false);
      }
    };
    loadPrefs();
  }, []);

  const persist = async (nextPrefs: Preferences, nextType: NotificationType) => {
    setPrefs(nextPrefs);
    setNotificationType(nextType);
    try {
      const toStore: StoredPrefs = { ...nextPrefs, notificationType: nextType };
      await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(toStore));
    } catch (e) {
      console.error("Failed to save preferences", e);
    }
  };

  const update = async (partial: Partial<Preferences>) => {
    const next = { ...prefs, ...partial };
    await persist(next, notificationType);
  };

  const changeNotificationType = (type: NotificationType) => {
    persist(prefs, type);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading preferences…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Food & Notification Preferences</Text>
      <Text style={styles.subtitle}>
        These preferences control which events you see and, in the future,
        how CUFF contacts you when new food is posted.
      </Text>

    <Text style={styles.sectionHeader}>Notification method</Text>
      <View style={styles.chipRow}>
        {NOTIFICATION_OPTIONS.map((option) => {
          const selected = option === notificationType;
          return (
            <Pressable
              key={option}
              onPress={() => changeNotificationType(option)}
              style={[
                styles.chip,
                selected && styles.chipSelected,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  selected && styles.chipTextSelected,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>

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
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#005CA9",
  },
  chipSelected: {
    backgroundColor: "#005CA9",
  },
  chipText: {
    fontSize: 13,
    color: "#005CA9",
  },
  chipTextSelected: {
    color: "#fff",
  },
});
