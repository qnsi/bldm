import ProjectScreen from "src/features/project/screen";
import ProjectsScreen from "src/features/projects/screen";
import WorkspacesScreen from "src/features/teams/Workspaces/screen";
import AcceptInviteScreen from "src/features/teams/AcceptInvitation/screen";
import { createStackNavigator } from "@react-navigation/stack";

const Stack = createStackNavigator();

export const ScreenNavigator = () => {
  const screenOptions = {
    headerStyle: {
      backgroundColor: "#FFF8EC",
    },
    headerTitle: "BUILD ME",
    headerShadowVisible: false,
    headerPressColor: "#658F72",
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
