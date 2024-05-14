import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
} from "react-native";
import { Workspace } from "src/features/teams/Workspaces/models";
import { useSession } from "src/utils/sessionContext";
import { supabase } from "src/utils/supabase";
import { styles } from "./styles";
import AddNewProject from "./components/AddNewProject";
import { useGetProjects } from "./api";
import { ProjectsHeader } from "./components/ProjectsHeader";
import { useFetchProjectThumbnails } from "./hooks/useFetchProjectThumbnails";
import { Spinner } from "tamagui";

export default function ProjectScreen({ route, navigation }) {
  const workspace = route.params as Workspace;
  const { projects, getProjectsQuery } = useGetProjects(workspace.account_id);
  const thumbnails = useFetchProjectThumbnails(workspace, projects);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <ProjectsHeader workspaceAccountId={workspace.account_id} />
      ),
    });
  }, [navigation, workspace.account_id]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Projekty w zespole {workspace.name}</Text>
      {getProjectsQuery.isPending && <Spinner size="large" />}
      {getProjectsQuery.isError && <Text>Cos poszlo nie tak</Text>}
      <FlatList
        style={styles.projects}
        data={projects}
        renderItem={({ item, index }) => (
          <View>
            <Pressable
              style={styles.project}
              onPress={() =>
                navigation.navigate("Project", {
                  project: item,
                  workspace: workspace,
                })
              }
            >
              <Image
                style={styles.thumbnail}
                source={{
                  uri:
                    thumbnails.find((thumbnail) => thumbnail.id === item.id)
                      ?.img || "",
                }}
              />
              <Text style={styles.projectName}>{item.name}</Text>
            </Pressable>
          </View>
        )}
      />
      <AddNewProject workspace={workspace} />
    </View>
  );
}
