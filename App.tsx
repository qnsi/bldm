import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./components/WorkspacesScreen";
import ProjectScreen from "./components/ProjectScreen";
import { supabase } from "./utils/supabase";
import { Session } from "@supabase/supabase-js";
import { SessionContext } from "./utils/sessionContext";
import { AuthScreen } from "./components/Auth.native";
import { StyleSheet, Pressable, Text, View } from "react-native";
import ProjectsScreen from "./components/ProjectsScreen";
import WorkspacesScreen from "./components/WorkspacesScreen";

const Stack = createStackNavigator();

export default function App() {
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
    <NavigationContainer>
      <SessionContext.Provider value={session}>
        {session && session.user ? (
          <MainApp session={session} />
        ) : (
          <AuthScreen />
        )}
      </SessionContext.Provider>
    </NavigationContainer>
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
        <Pressable onPress={() => setDropdownVisible((prev) => !prev)}>
          <Text>{session?.user?.email || ""}</Text>
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
    </Stack.Navigator>
  );
};
