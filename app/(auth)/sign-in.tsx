/**
 * Sign-in screen for CUFF. Uses Clerk to authenticate with Creighton email
 * and routes users into the main tab navigator on success.
 */

import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { colors } from "@/constants/theme";

export default function SignInScreen() {
  // Clerk hook for sign-in and session management
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  // Local form + UI state
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Primary handler for "Sign in" button
  const onSignInPress = async () => {
    if (!isLoaded) return; // Ensure Clerk is ready

    setError("");
    setIsLoading(true);

    try {
      // Ask Clerk to create a sign-in attempt with the given credentials
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      // If Clerk marks this as complete, we can activate the session
      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        
        // Send the user into the main app flow
        router.replace("/(tabs)");
      } else {
        // Non-complete states can occur with more complex auth flows
        setError("Sign-in incomplete. Please try again.");
      }
    } catch (err: any) {
      // Prefer Clerk's longMessage, then fall back to a generic message
      const errorMessage =
        err.errors?.[0]?.longMessage || 
        "An error occurred. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // While Clerk is initializing, show a simple loading UI
  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.cuBlue} />
        <Text style={styles.loadingText}>Loading…</Text>
      </View>
    );
  }

  // Disable sign-in when busy or required fields are empty
  const signInDisabled =
    isLoading || !emailAddress.trim() || !password.trim();

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>
          Sign in with your Creighton email to see leftover food events and
          manage your CUFF preferences.
        </Text>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Text style={styles.label}>Creighton email</Text>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          value={emailAddress}
          placeholder="name@creighton.edu"
          placeholderTextColor={colors.cuLightGray}
          onChangeText={setEmailAddress}
          style={styles.input}
          editable={!isLoading}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          value={password}
          placeholder="Enter your password"
          placeholderTextColor={colors.cuLightGray}
          secureTextEntry
          onChangeText={setPassword}
          style={styles.input}
          editable={!isLoading}
        />

        <Pressable
          style={[styles.primaryButton, signInDisabled && styles.buttonDisabled]}
          onPress={onSignInPress}
          disabled={signInDisabled}
        >
          <Text style={styles.primaryButtonText}>
            {isLoading ? "Signing in…" : "Sign in"}
          </Text>
        </Pressable>

        <View style={styles.linksRow}>
          <Link href="/(auth)/forgot-password" asChild>
            <Pressable disabled={isLoading}>
              <Text style={styles.linkText}>Forgot password?</Text>
            </Pressable>
          </Link>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.footerText}>New to CUFF? </Text>
          <Link href="/(auth)/sign-up" asChild>
            <Pressable disabled={isLoading}>
              <Text style={styles.footerLinkText}>Create an account</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// Presentational styles for the sign-in screen
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
    padding: 22,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.cuNavy,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: "#555",
    marginBottom: 18,
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
    marginTop: 18,
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
  linksRow: {
    marginTop: 14,
    alignItems: "flex-end",
  },
  linkText: {
    fontSize: 13,
    color: colors.cuNavy,
    textDecorationLine: "underline",
  },
  footerRow: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "center",
  },
  footerText: {
    fontSize: 13,
    color: "#444",
  },
  footerLinkText: {
    fontSize: 13,
    color: colors.cuBlue,
    fontWeight: "600",
  },
  errorContainer: {
    backgroundColor: "#FDECEC",
    borderColor: "#E29595",
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  errorText: {
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