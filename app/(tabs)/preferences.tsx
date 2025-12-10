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
import { useUser } from "../../hooks/UserContext";
import { updateUserPreferences } from "../../lib/api";
import { useRouter } from "expo-router";
import { colors } from "@/constants/theme";

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
  const router = useRouter();
    const { user, loading: userLoading, setUser } = useUser();

  const [prefs, setPrefs] = useState<Preferences>({
    highlightVeg: false,
    highlightVegan: false,
    avoidNuts: false,
    avoidGluten: false,
    avoidDairy: false,
  });
  const [notificationType, setNotificationType] =
    useState<NotificationType>("Both");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadLocalPrefs = async () => {
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
            NOTIFICATION_OPTIONS.includes(
              stored.notificationType as NotificationType
            )
          ) {
            setNotificationType(stored.notificationType as NotificationType);
          }
        }
      } catch (e) {
        console.error("Failed to load preferences from AsyncStorage", e);
      } finally {
        setLoading(false);
      }
    };
    loadLocalPrefs();
  }, []);

  // 2) Once user is loaded, initialize from server values
  useEffect(() => {
    if (userLoading) return;
    if (!user) return;

    // notificationType from server
    if (
      user.notificationType &&
      NOTIFICATION_OPTIONS.includes(user.notificationType as NotificationType)
    ) {
      setNotificationType(user.notificationType as NotificationType);
    } else {
      setNotificationType("Both");
    }

    // dietaryPreferences from server (JSON-encoded toggles)
    if (user.dietaryPreferences) {
      try {
        const parsed = JSON.parse(
          user.dietaryPreferences
        ) as Partial<Preferences>;
        setPrefs((prev) => ({
          ...prev,
          highlightVeg: parsed.highlightVeg ?? prev.highlightVeg,
          highlightVegan: parsed.highlightVegan ?? prev.highlightVegan,
          avoidNuts: parsed.avoidNuts ?? prev.avoidNuts,
          avoidGluten: parsed.avoidGluten ?? prev.avoidGluten,
          avoidDairy: parsed.avoidDairy ?? prev.avoidDairy,
        }));
      } catch (e) {
        console.warn("Could not parse dietaryPreferences from server", e);
      }
    }
  }, [userLoading, user]);

  const persist = async (nextPrefs: Preferences, nextType: NotificationType) => {
    setPrefs(nextPrefs);
    setNotificationType(nextType);

    try {
      const toStore: StoredPrefs = { ...nextPrefs, notificationType: nextType };
      await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(toStore));
    } catch (e) {
      console.error("Failed to save preferences", e);
    }

    // Sync to backend if we have a logged-in user
    if (user) {
      try {
        const dietaryPreferences = JSON.stringify(nextPrefs);
        const updatedUser = await updateUserPreferences(user.id, {
          notificationType: nextType,
          dietaryPreferences,
        });
        console.log("Synced preferences to backend", updatedUser);
        setUser(updatedUser);
      } catch (e) {
        console.error("Failed to sync preferences to backend", e);
      }
    }
  };

  const update = async (partial: Partial<Preferences>) => {
    const next = { ...prefs, ...partial };
    await persist(next, notificationType);
  };

  const changeNotificationType = (type: NotificationType) => {
    persist(prefs, type);
  };

  return (
    <ScrollView 
        contentContainerStyle={styles.container}
        style={{ backgroundColor: colors.cuLightGray }}
    >
      <Text style={styles.title}>Food & Notification Preferences</Text>
      <Text style={styles.subtitle}>
        Choose how CUFF highlights events for you and how you’d like to be
        contacted when new food is posted.
      </Text>

    <View style={styles.card}>
        <Text style={styles.cardTitle}>Notification method</Text>
        <Text style={styles.cardDescription}>
            This controls how CUFF may contact you in the future when new events
            are posted.
        </Text>

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
    </View>

    <View style={styles.card}>
        <Text style={styles.cardTitle}>Highlight options I like</Text>
        <Text style={styles.cardDescription}>
            We'll visually emphasize events that include these dietary options in
            their description.
        </Text>

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
    </View>

    <View style={styles.card}>
        <Text style={styles.cardTitle}>Hide events with allergens I avoid</Text>
        <Text style={styles.cardDescription}>
            Events that clearly mention these ingredients will be hidden from your
            dashboard.
        </Text>

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
    </View>
    
    <View style={styles.card}>
        <Text style={styles.cardTitle}>Account</Text>
        <Text style={styles.cardDescription}>
            Manage settings related to your CUFF account.
        </Text>

        <Pressable
            style={styles.changePasswordButton}
            onPress={() => router.push("/change-password")}
        >
            <Text style={styles.changePasswordText}>Change Password</Text>
        </Pressable>
    </View>
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
  container: { 
    padding: 20, 
    paddingBottom: 40 
    },
  title: { 
    fontSize: 22, 
    fontWeight: "700", 
    marginBottom: 4,
    color: colors.cuNavy,
},
  subtitle: { 
    fontSize: 13, 
    marginBottom: 16, 
    color: "#444" 
},
    card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e1e4ec",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    color: colors.cuNavy,
  },
  cardDescription: {
    fontSize: 12,
    color: "#555",
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f2f7",
  },
  optionTitle: { 
    fontSize: 14, 
    fontWeight: "500",
    color: "#222", 
},
  optionDescription: { 
    fontSize: 12, 
    color: "#666", 
    marginTop: 2, 
},
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.cuBlue,
    backgroundColor: colors.white,
  },
  chipSelected: {
    backgroundColor: colors.cuBlue,
  },
  chipText: {
    fontSize: 13,
    color: colors.cuBlue,
  },
  chipTextSelected: {
    color: colors.white,
    fontWeight: "600",
  },
  changePasswordButton: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cuBlue,
    alignSelf: "flex-start",
    backgroundColor: "#f5f8ff",
  },
  changePasswordText: {
    fontSize: 14,
    color: colors.cuBlue,
    fontWeight: "600",
  },
});
