import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./components/HomeScreen";
import ProjectScreen from "./components/ProjectScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
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
    </NavigationContainer>
  );
}
