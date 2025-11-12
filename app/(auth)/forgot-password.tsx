import { useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";

export default function ForgotPassword() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [stage, setStage] = useState<"request" | "reset">("request");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const requestReset = async () => {
    if (!isLoaded || !signIn) return;
    setError("");
    setBusy(true);
    try {
      // 1) Start a sign-in for this identifier (email)
      await signIn.create({ identifier: email });

      // 2) Find the reset factor and extract the emailAddressId
      const emailFactor = (signIn.supportedFirstFactors ?? []).find(
        (f: any) => f.strategy === "reset_password_email_code" && f.emailAddressId
      ) as { strategy: "reset_password_email_code"; emailAddressId: string } | undefined;

      if (!emailFactor) {
        throw new Error(
          "Email code password reset is not enabled for this account. Enable it in Clerk or use the supported strategy."
        );
      }

      // 3) Prepare the first factor with BOTH strategy and emailAddressId (fixes TS error)
      await signIn.prepareFirstFactor({
        strategy: "reset_password_email_code",
        emailAddressId: emailFactor.emailAddressId,
      });

      setStage("reset");
    } catch (e: any) {
      setError(e?.errors?.[0]?.longMessage ?? e?.message ?? "Unable to send reset email.");
    } finally {
      setBusy(false);
    }
  };

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
        // Optional: activate the session or route back to sign-in
        await setActive?.({ session: attempt.createdSessionId });
        router.replace("/(auth)/sign-in"); // or "/(tabs)" if you prefer auto-login after reset
        return;
      }
      setError("Reset not complete. Double-check the code and try again.");
    } catch (e: any) {
      setError(e?.errors?.[0]?.longMessage ?? e?.message ?? "Could not reset password.");
    } finally {
      setBusy(false);
    }
  };

  if (!isLoaded) return <View style={{ padding: 20 }}><Text>Loading…</Text></View>;

  return (
    <View style={{ padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>
        {stage === "request" ? "Reset your password" : "Enter code & new password"}
      </Text>

      {stage === "request" ? (
        <>
          <TextInput
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 6 }}
            editable={!busy}
          />
          <Button title={busy ? "Sending…" : "Send reset email"} onPress={requestReset} disabled={busy || !email} />
        </>
      ) : (
        <>
          <TextInput
            placeholder="Email code"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 6 }}
            editable={!busy}
          />
          <TextInput
            placeholder="New password"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
            style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 6 }}
            editable={!busy}
          />
          <Button
            title={busy ? "Updating…" : "Update password"}
            onPress={reset}
            disabled={busy || !code || !newPassword}
          />
        </>
      )}

      {!!error && <Text style={{ color: "red" }}>{error}</Text>}
    </View>
  );
}
