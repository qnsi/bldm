import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
} from "react-native";
import { createClient } from "@supabase/supabase-js";
import { Workspace } from "./WorkspacesScreen";
import { useSession } from "../utils/sessionContext";
import { supabase } from "../utils/supabase";

export type Project = {
  name: string;
  numberOfTasks: number;
  thumbnail: string;
  plans: string[];
};

export default function HomeScreen({ route, navigation }) {
  const workspace = route.params as Workspace;
  const session = useSession();
  const [projects, setProjects] = React.useState<Project[]>([]);
  useEffect(() => {
    console.log(
      "HomeScreen: useEffect fetching projects for workspace.id: ",
      workspace.id,
    );
    console.log("HomeScreen: session.user.id", session?.user.id);
    supabase
      .from("projects")
      .select()
      .eq("workspace_id", workspace.id)
      .then((result) => {
        console.log("HomeScreen: useEffect projects fetching result: ", result);
        // result:  {"count": null, "data": [{"created_at": "2024-03-19T18:03:44.38948+00:00", "id": 1, "name": "Garwolin", "thumbnail_url": "https://okqjlkjppcfdjjmumweh.supabase.co/storage/v1/object/sign/plan_thumbnails/Garwolin.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwbGFuX3RodW1ibmFpbHMvR2Fyd29saW4uanBnIiwiaWF0IjoxNzEwODcxMzI5LCJleHAiOjIwMjYyMzEzMjl9.GO-14NIxlxtdcQCvOnGK9G8RuQTxIL7aD8IRKmKFHD0"}], "error": null, "status": 200, "statusText": ""}
        if (result.data === null) return;
        setProjects(
          result.data?.map((project) => {
            return {
              name: project.name,
              numberOfTasks: 0,
              thumbnail: project.thumbnail_url,
              plans: [],
            } as Project;
          }),
        );
      });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Projekty w zespole {workspace.name}</Text>
      <FlatList
        style={styles.projects}
        data={projects}
        renderItem={({ item, index }) => (
          <View>
            <Pressable
              style={styles.project}
              onPress={() => navigation.navigate("Project", item)}
            >
              <Image
                style={styles.thumbnail}
                source={{ uri: item.thumbnail }}
              />
              <Text style={styles.projectName}>{item.name}</Text>
            </Pressable>
          </View>
        )}
      />
      <Pressable style={styles.addNew}>
        <View>
          <Text>Dodaj nowy projekt</Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    marginLeft: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    margin: 10,
  },
  project: {
    display: "flex",
    flexDirection: "row",
    // justifyContent: "space-between",
    // alignItems: "center",
    padding: 10,
  },
  odd: {},
  even: {},
  projectName: {
    fontWeight: "bold",
    marginTop: 5,
    marginLeft: 10,
  },
  thumbnail: {
    height: 50,
    width: 50,
    borderRadius: 10,
  },
  projects: {
    // height: "80%",
    flexGrow: 1,
  },
  addNew: {
    height: "10%",
  },
});
