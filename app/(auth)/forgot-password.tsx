/**
 * Screen for handling the two-stage "forgot password" flow using Clerk:
 * 1) Request a reset email code
 * 2) Submit the code + new password to complete the reset
 */

import { useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { 
  ActivityIndicator,
  Button, 
  Text, 
  TextInput, 
  View,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { colors } from "@/constants/theme";

// Represents which step of the reset flow we're in
type Stage = "request" | "reset";

export default function ForgotPassword() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  // Local form state
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [stage, setStage] = useState<"request" | "reset">("request");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Step 1: send a reset email code via Clerk
  const requestReset = async () => {
    if (!isLoaded || !signIn) return;
    setError("");
    setBusy(true);
    try {
      // Start a sign-in attempt with the provided email
      await signIn.create({ identifier: email });

      // Find the factor that supports "reset password via email code"
      const emailFactor = (signIn.supportedFirstFactors ?? []).find(
        (f: any) => 
          f.strategy === "reset_password_email_code" && f.emailAddressId
      ) as 
        | { 
            strategy: "reset_password_email_code"; 
            emailAddressId: string; 
          } | undefined;

      if (!emailFactor) {
        throw new Error(
          "Password reset by email code is not enabled for this account."
        );
      }

      // Prepare that factor so Clerk sends the one-time code email
      await signIn.prepareFirstFactor({
        strategy: "reset_password_email_code",
        emailAddressId: emailFactor.emailAddressId,
      });

      // Move UI to the "enter code + new password" step
      setStage("reset");
    } catch (e: any) {
      // Prefer Clerk's longMessage, then generic message, then fallback
      setError(e?.errors?.[0]?.longMessage ?? 
        e?.message ?? "Unable to send reset email."
      );
    } finally {
      setBusy(false);
    }
  };

  // Step 2: verify the code and set the new password
  const reset = async () => {
    if (!isLoaded || !signIn) return;
    setError("");
    setBusy(true);
    try {
      const attempt = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password: newPassword,
      });

      if (attempt.status === "complete") {
        // Optionally activate the session and redirect to sign-in (or main app)
        await setActive?.({ session: attempt.createdSessionId });
        router.replace("/(auth)/sign-in"); // Change to "/(tabs)" if you want auto-login after reset
        return;
      }

      // If Clerk didn't mark the attempt "complete", something is still wrong
      setError("Reset not complete. Double-check the code and try again.");
    } catch (e: any) {
      setError(
        e?.errors?.[0]?.longMessage ?? e?.message ?? "Could not reset password."
      );
    } finally {
      setBusy(false);
    }
  };

  // While Clerk is initializing, show a simple loading state
  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.cuBlue} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Choose the primary action based on the current stage
  const onPrimaryPress = stage === "request" ? requestReset : reset;
  
  // Disable primary button when we're busy or required fields are empty
  const primaryDisabled =
    busy ||
    (stage === "request" ? !email.trim() : !code.trim() || !newPassword.trim());

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Forgot your password?</Text>
        <Text style={styles.subtitle}>
          {stage === "request"
            ? "Enter the email you use with CUFF and we’ll send a one-time code to reset your password."
            : "Check your email for the one-time code, then create a new password below."}
        </Text>

        {stage === "request" ? (
          <>
            <Text style={styles.label}>Creighton email</Text>
            <TextInput
              placeholder="name@creighton.edu"
              placeholderTextColor={colors.cuLightGray}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              editable={!busy}
            />
          </>
        ) : (
          <>
            <Text style={styles.label}>Email code</Text>
            <TextInput
              placeholder="6-digit code"
              placeholderTextColor={colors.cuLightGray}
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              style={styles.input}
              editable={!busy}
            />

            <Text style={styles.label}>New password</Text>
            <TextInput
              placeholder="Create a new password"
              placeholderTextColor={colors.cuLightGray}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              style={styles.input}
              editable={!busy}
            />
          </>
        )}

        {!!error && <Text style={styles.errorText}>{error}</Text>}

        <Pressable
          style={[styles.primaryButton, primaryDisabled && styles.buttonDisabled]}
          onPress={onPrimaryPress}
          disabled={primaryDisabled}
        >
          <Text style={styles.primaryButtonText}>
            {busy
              ? stage === "request"
                ? "Sending…"
                : "Updating…"
              : stage === "request"
              ? "Send reset email"
              : "Update password"}
          </Text>
        </Pressable>

        {stage === "reset" && (
          <Pressable
            onPress={() => setStage("request")}
            disabled={busy}
            style={styles.secondaryLink}
          >
            <Text style={styles.secondaryLinkText}>
              Didn’t get a code? Try a different email.
            </Text>
          </Pressable>
        )}

        <Pressable
          onPress={() => router.replace("/(auth)/sign-in")}
          disabled={busy}
          style={styles.backToSignIn}
        >
          <Text style={styles.backToSignInText}>Back to sign in</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

// Presentational styles for the screen
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cuNavy,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.cuNavy,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: "#555",
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.cuNavy,
    marginBottom: 4,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.cuLightGray,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#000",
  },
  primaryButton: {
    marginTop: 20,
    backgroundColor: colors.cuBlue,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },
  primaryButtonText: {
    color: colors.white,
    fontWeight: "600",
    fontSize: 15,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  secondaryLink: {
    marginTop: 10,
    alignItems: "center",
  },
  secondaryLinkText: {
    fontSize: 13,
    color: colors.cuNavy,
    textDecorationLine: "underline",
  },
  backToSignIn: {
    marginTop: 18,
    alignItems: "center",
  },
  backToSignInText: {
    fontSize: 13,
    color: "#555",
  },
  errorText: {
    marginTop: 10,
    color: "#B00020",
    fontSize: 13,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.cuNavy,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 8,
    color: colors.white,
  },
});