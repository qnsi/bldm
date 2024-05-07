import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./src/screens/WorkspacesScreen";
import ProjectScreen from "./src/screens/ProjectScreen";
import { supabase } from "./utils/supabase";
import { Session } from "@supabase/supabase-js";
import { SessionContext } from "./utils/sessionContext";
import { AuthScreen } from "./src/screens/Auth.native";
import { StyleSheet, Pressable, Text, View } from "react-native";
import ProjectsScreen from "./src/screens/ProjectsScreen";
import WorkspacesScreen from "./src/screens/WorkspacesScreen";

import { TamaguiProvider } from "tamagui";
import { tamaguiConfig } from "./tamagui.config";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useColorScheme } from "react-native";

import * as Linking from "expo-linking";
import AcceptInviteScreen from "./src/screens/AcceptInviteScreen";

const prefix = Linking.createURL("/");

const Stack = createStackNavigator();

export default function App() {
  const colorScheme = useColorScheme();
  const linking = {
    prefixes: [prefix],
    config: {
      screens: {
        AcceptInvite: "accept-invite/:token",
      },
    },
  };
  console.log("linking: ", linking);
  const [session, setSession] = React.useState<Session | null>(null);
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("refreshing session, session: ", session);
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={"light"}>
      <NavigationContainer linking={linking}>
        <SessionContext.Provider value={session}>
          {session && session.user ? (
            <MainApp session={session} />
          ) : (
            <AuthScreen />
          )}
        </SessionContext.Provider>
      </NavigationContainer>
    </TamaguiProvider>
  );
}

const DropdownMenu = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <View style={styles.dropdown}>
      <Pressable
        onPress={() => supabase.auth.signOut()}
        style={styles.dropdownItem}
      >
        <Text>Sign Out</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    position: "absolute",
    right: 10,
    top: 50,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
  },
  dropdownItem: {
    padding: 10,
  },
});

const MainApp = ({ session }: { session: Session | null }) => {
  const [dropdownVisible, setDropdownVisible] = React.useState(false);

  const screenOptions = {
    headerTitle: "BUILD ME",
    headerRight: () => (
      <>
        <Pressable
          style={
            StyleSheet.create({ pressable: { paddingRight: 20 } }).pressable
          }
          onPress={() => setDropdownVisible((prev) => !prev)}
        >
          <Text>...</Text>
        </Pressable>
        <DropdownMenu isVisible={dropdownVisible} />
      </>
    ),
  };

  return (
    <Stack.Navigator initialRouteName="Workspaces">
      <Stack.Screen
        name="Workspaces"
        component={WorkspacesScreen}
        options={screenOptions}
      />
      <Stack.Screen
        name="Projects"
        component={ProjectsScreen}
        options={screenOptions}
      />
      <Stack.Screen
        name="Project"
        component={ProjectScreen}
        options={screenOptions}
      />
      <Stack.Screen
        name="AcceptInvite"
        component={AcceptInviteScreen}
        options={screenOptions}
      />
    </Stack.Navigator>
  );
};
