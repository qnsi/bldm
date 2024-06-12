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
import { useDeleteWorkspace, useGetProjects, useSaveProject } from "./api";
import { ProjectsHeader } from "./components/ProjectsHeader";
import { useFetchProjectThumbnails } from "./hooks/useFetchProjectThumbnails";
import { AlertDialog, Button, Spinner, XStack, YStack } from "tamagui";
import { UseMutationResult } from "@tanstack/react-query";

export default function ProjectScreen({ route, navigation }) {
  const workspace = route.params as Workspace;
  const { projects, getProjectsQuery } = useGetProjects(workspace.account_id);
  const [dropdownVisible, setDropdownVisible] = React.useState(false);
  const thumbnails = useFetchProjectThumbnails(workspace, projects);
  const [imageBase64, setImageBase64] = React.useState<string>("");

  const deleteWorkspaceMutation = useDeleteWorkspace();

  const saveProjectMutation = useSaveProject({
    imageBase64,
    workspaceAccountId: workspace.account_id,
  });

  const deleteWorkspace = () => {
    deleteWorkspaceMutation.mutate({ workspaceId: workspace.account_id });
    navigation.navigate("Workspaces");
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <ProjectsHeader
          isPrimaryOwner={workspace.is_primary_owner}
          deleteWorkspace={deleteWorkspace}
          workspaceAccountId={workspace.account_id}
          dropdownVisible={dropdownVisible}
          setDropdownVisible={setDropdownVisible}
        />
      ),
    });
  }, [navigation, workspace.account_id, dropdownVisible, setDropdownVisible]);

  const saveProject = (newProjectName: string) => {
    saveProjectMutation.mutate({
      newProjectName,
      workspaceAccountId: workspace.account_id,
    });
  };

  return (
    <View
      style={styles.container}
      onTouchStart={() => setDropdownVisible(false)}
    >
      <Text style={styles.header}>{workspace.name}</Text>
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
      <AddNewProject
        imageBase64={imageBase64}
        setImageBase64={setImageBase64}
        saveProject={saveProject}
      />
      <DeleteTeamDialog mutation={deleteWorkspaceMutation} />
      <AddProjectDialog mutation={saveProjectMutation} />
    </View>
  );
}

const AddProjectDialog = ({ mutation }) => {
  return (
    <AlertDialog native open={mutation.isError}>
      <AlertDialog.Trigger style={{ display: "none" }} />
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          key="overlay"
          animation="quick"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <AlertDialog.Content
          bordered
          elevate
          key="content"
          animation={[
            "quick",
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          x={0}
          scale={1}
          opacity={1}
          y={0}
        >
          {mutation.isError && (
            <YStack space>
              <AlertDialog.Title>Cos poszlo nie tak!</AlertDialog.Title>
              <AlertDialog.Description>
                Projekt nie został dodany
              </AlertDialog.Description>

              <XStack space="$3" justifyContent="flex-end">
                <AlertDialog.Action asChild>
                  <Button theme="active">Ok</Button>
                </AlertDialog.Action>
              </XStack>
            </YStack>
          )}
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog>
  );
};

const DeleteTeamDialog = ({
  mutation,
}: {
  mutation: UseMutationResult<null, Error, { workspaceId: string }, unknown>;
}) => {
  return (
    <AlertDialog native open={mutation.isError}>
      <AlertDialog.Trigger style={{ display: "none" }} />
      <AlertDialog.Portal>
        <AlertDialog.Overlay
          key="overlay"
          animation="quick"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <AlertDialog.Content
          bordered
          elevate
          key="content"
          animation={[
            "quick",
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          x={0}
          scale={1}
          opacity={1}
          y={0}
        >
          {mutation.isError && (
            <YStack space>
              <AlertDialog.Title>Cos poszlo nie tak!</AlertDialog.Title>
              <AlertDialog.Description>
                Zespol nie zostal usuniety
              </AlertDialog.Description>

              <XStack space="$3" justifyContent="flex-end">
                <AlertDialog.Action asChild>
                  <Button theme="active">Ok</Button>
                </AlertDialog.Action>
              </XStack>
            </YStack>
          )}
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog>
  );
};
