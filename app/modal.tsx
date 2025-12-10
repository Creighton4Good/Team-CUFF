import { useRouter } from "expo-router";
import React from "react";
import { 
  StyleSheet,
  Text,
  View,
  Pressable,
  Modal, 
} from 'react-native';
import { colors } from "@/constants/theme";

export default function ModalScreen() {
  const router = useRouter();

  const closeModal = () => {
    router.back();
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.title}>Heads up!</Text>

        <Text style={styles.message}>
          This is a placeholder modal screen. Your team can use this as a global
          modal template for confirmations or important announcements.
        </Text>

        <Pressable style={styles.button} onPress={closeModal}>
          <Text style={styles.buttonText}>Dismiss</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  card: {
    backgroundColor: colors.white,
    padding: 24,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.cuNavy,
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    color: colors.cuGray,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  button: {
    backgroundColor: colors.cuNavy,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
