/**
 * Multi-stage sign-up flow for CUFF using Clerk.
 * Stages:
 * 1) "form"    – collect user details + notification preference
 * 2) "confirm" - review entered data before creating the account
 * 3) "verify"  - enter email verification code and complete sign-up
 */

import { useSignUp } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { colors } from "@/constants/theme";

type NotificationPref = "in-app" | "email" | "both";
type Stage = "form" | "confirm" | "verify";

export default function SignUpScreen() {
  // Clerk hook for sign-up and session management
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  // User identity fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");

  // Notification preference for CUFF (persisted after verification)
  const [notif, setNotif] = useState<NotificationPref>("in-app");

  // Multi-step flow + verification code and UI state
  const [stage, setStage] = useState<Stage>("form");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Move from the "form" step to the "confirm" step after basic validation
  const onReviewAndConfirm = () => {
    if (!firstName || !lastName || !emailAddress || !password) {
      setError("Please complete all fields before continuing.");
      return;
    }
    setError("");
    setStage("confirm");
  };

  // Step 1: Create the user account and send a verification code
  const onSignUpPress = async () => {
    if (!isLoaded) return;
    setError("");
    setIsLoading(true);

    try {
      // Create the account in Clerk with the provided details
      await signUp.create({
        emailAddress,
        password,
        firstName,
        lastName,
      });

      // Trigger an email verification code to the user
      await signUp.prepareEmailAddressVerification({ 
        strategy: "email_code" 
      });

      // Switch UI to the "verify" step
      setStage("verify");
    } catch (err: any) {
      const errorMessage =
        err.errors?.[0]?.longMessage || "An error occurred. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify the email code and finalize account + preferences
  const onPressVerify = async () => {
    if (!isLoaded) return;
    setError("");
    setIsLoading(true);

    try {
      // Attempt to verify the code the user entered
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === "complete") {
        // Activate the new session
        await setActive({ session: signUpAttempt.createdSessionId });

        // Persist notification preferences for later use in the app
        await AsyncStorage.setItem("@prefs", JSON.stringify({ notif }));

        // Navigate into the main app flow
        router.replace("/(tabs)");
      } else {
        setError("Verification incomplete. Please try again.");
      }
    } catch (err: any) {
      const errorMessage =
        err.errors?.[0]?.longMessage || "Invalid verification code.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // While Clerk is initializing, show a simple loading state
  if (!isLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.cuBlue} />
        <Text style={styles.loadingText}>Loading…</Text>
      </View>
    );
  }

  // Disable continue buttons if we're busy or required fields are empty
  const formDisabled =
    isLoading ||
    !firstName.trim() ||
    !lastName.trim() ||
    !emailAddress.trim() ||
    !password.trim();

  const verifyDisabled = isLoading || !code.trim();

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {stage !== "verify" ? (
            <>
              <Text style={styles.title}>Create your CUFF account</Text>
              <Text style={styles.subtitle}>
                Sign up with your Creighton email to get notified when leftover
                food is available on campus.
              </Text>

              {!!error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {stage === "form" && (
                <>
                  <Text style={styles.label}>First name</Text>
                  <TextInput
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="First name"
                    placeholderTextColor={colors.cuLightGray}
                    style={styles.input}
                    editable={!isLoading}
                  />

                  <Text style={styles.label}>Last name</Text>
                  <TextInput
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Last name"
                    placeholderTextColor={colors.cuLightGray}
                    style={styles.input}
                    editable={!isLoading}
                  />

                  <Text style={styles.label}>Creighton email</Text>
                  <TextInput
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={emailAddress}
                    onChangeText={setEmailAddress}
                    placeholder="name@creighton.edu"
                    placeholderTextColor={colors.cuLightGray}
                    style={styles.input}
                    editable={!isLoading}
                  />

                  <Text style={styles.label}>Password</Text>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Create a password"
                    placeholderTextColor={colors.cuLightGray}
                    secureTextEntry
                    style={styles.input}
                    editable={!isLoading}
                  />

                  <Text style={styles.sectionLabel}>
                    Notification preference
                  </Text>
                  <Text style={styles.sectionHint}>
                    You can change this later in Preferences.
                  </Text>

                  {/* Simple chip-style selector for notification preference */}
                  <View style={styles.chipRow}>
                    {(["in-app", "email", "both"] as NotificationPref[]).map(
                      (option) => {
                        const selected = option === notif;
                        const label =
                          option === "in-app"
                            ? "In-App"
                            : option === "email"
                            ? "Email"
                            : "Both";
                        return (
                          <Pressable
                            key={option}
                            onPress={() => setNotif(option)}
                            style={[
                              styles.chip,
                              selected && styles.chipSelected,
                            ]}
                            disabled={isLoading}
                          >
                            <Text
                              style={[
                                styles.chipText,
                                selected && styles.chipTextSelected,
                              ]}
                            >
                              {label}
                            </Text>
                          </Pressable>
                        );
                      }
                    )}
                  </View>

                  <Pressable
                    style={[
                      styles.primaryButton,
                      formDisabled && styles.buttonDisabled,
                    ]}
                    onPress={onReviewAndConfirm}
                    disabled={formDisabled}
                  >
                    <Text style={styles.primaryButtonText}>
                      Review & Confirm
                    </Text>
                  </Pressable>

                  <View style={styles.footerRow}>
                    <Text style={styles.footerText}>
                      Already have an account?{" "}
                    </Text>
                    <Link href="/(auth)/sign-in" asChild>
                      <Pressable disabled={isLoading}>
                        <Text style={styles.footerLinkText}>Sign in</Text>
                      </Pressable>
                    </Link>
                  </View>
                </>
              )}

              {stage === "confirm" && (
                <>
                  <Text style={styles.confirmTitle}>
                    Confirm your details
                  </Text>
                  <View style={styles.confirmBox}>
                    <Text style={styles.confirmLine}>
                      <Text style={styles.confirmLabel}>Name: </Text>
                      {firstName} {lastName}
                    </Text>
                    <Text style={styles.confirmLine}>
                      <Text style={styles.confirmLabel}>Email: </Text>
                      {emailAddress}
                    </Text>
                    <Text style={styles.confirmLine}>
                      <Text style={styles.confirmLabel}>Notifications: </Text>
                      {notif === "in-app"
                        ? "In-App"
                        : notif === "email"
                        ? "Email"
                        : "In-app & email"}
                    </Text>
                  </View>

                  <Pressable
                    style={[
                      styles.primaryButton,
                      isLoading && styles.buttonDisabled,
                    ]}
                    onPress={onSignUpPress}
                    disabled={isLoading}
                  >
                    <Text style={styles.primaryButtonText}>
                      {isLoading ? "Creating account…" : "Looks good — Create account"}
                    </Text>
                  </Pressable>

                  <Pressable
                    style={styles.secondaryButton}
                    onPress={() => setStage("form")}
                    disabled={isLoading}
                  >
                    <Text style={styles.secondaryButtonText}>Edit details</Text>
                  </Pressable>
                </>
              )}
            </>
          ) : (
            // "verify" stage: user enters their 6-digit email code
            <>
              <Text style={styles.title}>Verify your email</Text>
              <Text style={styles.subtitle}>
                Enter the 6-digit code sent to{" "}
                <Text style={{ fontWeight: "600" }}>{emailAddress}</Text>.
              </Text>

              {!!error && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <Text style={styles.label}>Verification code</Text>
              <TextInput
                value={code}
                onChangeText={setCode}
                placeholder="123456"
                placeholderTextColor={colors.cuLightGray}
                keyboardType="number-pad"
                style={styles.input}
                editable={!isLoading}
              />

              <Pressable
                style={[
                  styles.primaryButton,
                  verifyDisabled && styles.buttonDisabled,
                ]}
                onPress={onPressVerify}
                disabled={verifyDisabled}
              >
                <Text style={styles.primaryButtonText}>
                  {isLoading ? "Verifying…" : "Verify & continue"}
                </Text>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Presentational styles for the sign-up screen
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cuNavy,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 24,
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
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.cuNavy,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: "#555",
    marginBottom: 16,
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
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 14,
    color: colors.cuNavy,
  },
  sectionHint: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.cuBlue,
    backgroundColor: "transparent",
  },
  chipSelected: {
    backgroundColor: colors.cuBlue,
  },
  chipText: {
    fontSize: 13,
    color: colors.cuBlue,
    fontWeight: "500",
  },
  chipTextSelected: {
    color: colors.white,
  },
  primaryButton: {
    marginTop: 16,
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
  secondaryButton: {
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.cuBlue,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: colors.cuBlue,
    fontWeight: "600",
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  footerRow: {
    marginTop: 16,
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
  confirmTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.cuNavy,
    marginTop: 10,
    marginBottom: 6,
  },
  confirmBox: {
    borderWidth: 1,
    borderColor: colors.cuLightGray,
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#E9F2FB",
  },
  confirmLine: {
    fontSize: 14,
    marginBottom: 4,
  },
  confirmLabel: {
    fontWeight: "600",
    color: colors.cuNavy,
  },
});