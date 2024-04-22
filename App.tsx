import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./components/HomeScreen";
import ProjectScreen from "./components/ProjectScreen";
import { supabase } from "./utils/supabase";
import { Session } from "@supabase/supabase-js";
import { SessionContext } from "./utils/sessionContext";
import { AuthScreen } from "./components/Auth.native";

const Stack = createStackNavigator();

export default function App() {
  const [session, setSession] = React.useState<Session | null>(null);
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
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

const MainApp = ({ session }: { session: Session | null }) => {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerTitle: "BUILD ME" }}
      />
      <Stack.Screen
        name="Project"
        component={ProjectScreen}
        options={{ headerTitle: "BUILD ME" }}
      />
    </Stack.Navigator>
  );
};
