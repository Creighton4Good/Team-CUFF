import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { 
  Pressable, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TextInput, 
  View 
} from "react-native";
import { colors } from "@/constants/theme";

export default function ChangePasswordScreen() {
  // The `useUser` hook gives us access to the currently logged-in user
  const { user } = useUser();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onChangePasswordPress = async () => {
    if (!user) return;

    // Basic client-side validation
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
        setError("New password must be at least 8 characters long.");
        return;
    }

    setError("");
    setIsLoading(true);

    try {
      // Clerk's `user` object has a handy method for this!
      await user.updatePassword({
        currentPassword,
        newPassword,
      });

      // If successful, close the modal
      router.back();
    } catch (err: any) {
      const errorMessage =
        err.errors?.[0]?.longMessage || "An error occurred. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Change Password</Text>

       {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <Text style={styles.label}>Current Password</Text>
      <TextInput
        value={currentPassword}
        placeholder="••••••••"
        secureTextEntry
        onChangeText={setCurrentPassword}
        style={styles.input}
      />

      <Text style={styles.label}>New Password</Text>
      <TextInput
        value={newPassword}
        placeholder="At least 8 characters"
        secureTextEntry
        onChangeText={setNewPassword}
        style={styles.input}
      />

      <Text style={styles.label}>Confirm New Password</Text>
      <TextInput
        value={confirmPassword}
        placeholder="Re-enter new password"
        secureTextEntry
        onChangeText={setConfirmPassword}
        style={styles.input}
      />

      <Pressable
        style={[styles.button, isLoading && { opacity: 0.6 }]}
        onPress={onChangePasswordPress}
        disabled={isLoading}
      >

        <Text style={styles.buttonText}>
          {isLoading ? "Updating..." : "Update Password"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

// Use similar styles...
const styles = StyleSheet.create({
    container: { 
      flexGrow: 1, 
      backgroundColor: colors.white,
      justifyContent: 'center', 
      padding: 20 
    },
    title: { 
      fontSize: 28, 
      fontWeight: "700", 
      textAlign: 'center', 
      marginBottom: 28, 
      color: colors.cuNavy},
    label: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 6,
      color: colors.cuNavy,
    },
    input: {
      height: 48, 
      borderWidth: 1, 
      borderColor: colors.cuBlue, 
      backgroundColor: colors.white,
      paddingHorizontal: 12, 
      marginBottom: 16, 
      borderRadius: 8, 
      fontSize: 15 
    },
    button: {
      backgroundColor: colors.cuNavy,
      paddingVertical: 14,
      marginTop: 8,
      borderRadius: 8,
      alignItems: "center",
    },
    buttonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: "700",
    },
    errorBox: { 
      backgroundColor: "#FCE4E4", 
      padding: 12,
      borderRadius: 6, 
      marginBottom: 16,
      borderWidth: 1,
      borderColor: "#DC4C4C",
    },
    errorText: { 
      color: "#992121", 
      textAlign: "center",
      fontSize: 14,
      fontWeight: "500",
    },
});