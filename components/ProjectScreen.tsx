import { View, Text } from "react-native";
import { Project } from "./HomeScreen";

export default function ProjectScreen({ route, navigation }) {
  const project = route.params as Project;
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>{project.name}</Text>
    </View>
  );
}
