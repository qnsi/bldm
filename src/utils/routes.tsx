import ProjectScreen from "src/features/project/screens/ProjectScreen";
import ProjectsScreen from "src/features/projects/screens/ProjectsScreen";
import WorkspacesScreen from "src/features/teams/screens/WorkspacesScreen";
import AcceptInviteScreen from "src/features/teams/screens/AcceptInviteScreen";
import { createStackNavigator } from "@react-navigation/stack";
import { DefaultHeaderRight } from "src/components/DropdownMenu";

const Stack = createStackNavigator();

export const ScreenNavigator = () => {
  const screenOptions = {
    headerTitle: "BUILD ME",
    headerRight: () => <DefaultHeaderRight />,
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
