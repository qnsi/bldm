import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SessionContext } from "src/utils/sessionContext";
import { AuthScreen } from "src/features/auth/screens/Auth.native";

import { TamaguiProvider } from "tamagui";
import { tamaguiConfig } from "./tamagui.config";
import { DevToolsBubble } from "react-native-react-query-devtools";

import useSession from "src/hooks/useSession";
import { linking } from "src/utils/deepLinks";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ScreenNavigator } from "src/utils/routes";

const queryClient = new QueryClient();

export default function App() {
  const session = useSession();

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <TamaguiProvider config={tamaguiConfig} defaultTheme={"light"}>
          <NavigationContainer linking={linking}>
            <SessionContext.Provider value={session}>
              {session && session.user ? <MainApp /> : <AuthScreen />}
            </SessionContext.Provider>
          </NavigationContainer>
        </TamaguiProvider>
        <DevToolsBubble />
      </QueryClientProvider>
    </>
  );
}

const MainApp = () => {
  return <ScreenNavigator />;
};
