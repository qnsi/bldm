import {
  Platform,
  View,
  StyleSheet,
  AppState,
  Alert,
  TextInput,
  Image,
} from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { supabase } from "src/utils/supabase";
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import React, { useState } from "react";
import { Fieldset, Input, Label, Button } from "tamagui";
import { colors } from "src/styles/colors";

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});

export function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);
    if (!session)
      Alert.alert("Please check your inbox for email verification!");
    setLoading(false);
  }

  const EmailAuth = (
    <View style={styles.email}>
      <View style={styles.mt20}>
        <Fieldset>
          <Label
            unstyled
            style={styles.label}
            justifyContent="flex-end"
            htmlFor="name"
          >
            Email
          </Label>
          <Input
            id="email"
            defaultValue=""
            value={email}
            onChangeText={setEmail}
            autoCapitalize={"none"}
          />
        </Fieldset>
      </View>
      <View>
        <Fieldset>
          <Label
            unstyled
            style={styles.label}
            justifyContent="flex-end"
            htmlFor="password"
          >
            Hasło
          </Label>
          <Input
            id="password"
            defaultValue=""
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            autoCapitalize={"none"}
          />
        </Fieldset>
      </View>
      <View style={styles.buttons}>
        <Button
          style={[styles.button, styles.signInButton]}
          disabled={loading}
          onPress={() => signInWithEmail()}
        >
          Zaloguj
        </Button>
        <Button
          style={[styles.button, styles.signUpButton]}
          disabled={loading}
          onPress={() => signUpWithEmail()}
        >
          Zarejestruj
        </Button>
      </View>
    </View>
  );

  if (Platform.OS === "ios") {
    return (
      <View style={styles.container}>
        <Image
          style={styles.image}
          source={require("../../../../assets/build-me-logo.png")}
        />
        {EmailAuth}
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
          cornerRadius={9}
          style={styles.appleSignInButton}
          onPress={async () => {
            try {
              const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                  AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                  AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
              });
              if (credential.identityToken) {
                const {
                  error,
                  data: { user },
                } = await supabase.auth.signInWithIdToken({
                  provider: "apple",
                  token: credential.identityToken,
                });
                console.log(JSON.stringify({ error, user }, null, 2));
                if (!error) {
                  // User is signed in.
                }
              } else {
                throw new Error("No identityToken.");
              }
            } catch (e) {
              if (e.code === "ERR_REQUEST_CANCELED") {
                // handle that the user canceled the sign-in flow
              } else {
                // handle other errors
              }
            }
          }}
        />
      </View>
    );
  } else if (Platform.OS === "android") {
    GoogleSignin.configure({
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
      webClientId:
        "1066423396502-jh9qp1i0djpb2nu9f2gbnesf7d5lcem4.apps.googleusercontent.com",
    });

    console.log("image: ", require("../../../../assets/build-me-logo.png"));
    return (
      <View style={styles.container}>
        <Image
          style={styles.image}
          source={require("../../../../assets/build-me-logo.png")}
        />
        {EmailAuth}
        <GoogleSigninButton
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={async () => {
            try {
              await GoogleSignin.hasPlayServices();
              const userInfo = await GoogleSignin.signIn();
              if (userInfo.idToken) {
                const { data, error } = await supabase.auth.signInWithIdToken({
                  provider: "google",
                  token: userInfo.idToken,
                });
                console.log(error, data);
              } else {
                throw new Error("no ID token present!");
              }
            } catch (error: any) {
              if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                // user cancelled the login flow
              } else if (error.code === statusCodes.IN_PROGRESS) {
                // operation (e.g. sign in) is in progress already
              } else if (
                error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE
              ) {
                // play services not available or outdated
              } else {
                // some other error happened
              }
            }
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: colors.backgroundDark,
  },
  image: {
    marginTop: 100,
    width: 250,
    height: 250,
  },
  label: {
    marginBottom: 4,
    marginTop: 4,
  },
  email: {
    width: "70%",
  },
  mt20: {
    marginTop: 20,
  },
  buttons: {
    marginTop: 10,
  },
  button: { marginBottom: 10 },
  signUpButton: {
    color: colors.white,
    backgroundColor: colors.action,
  },
  signInButton: {
    color: colors.white,
    backgroundColor: colors.action,
  },
  appleSignInButton: {
    width: "70%",
    height: 44,
  },
});
