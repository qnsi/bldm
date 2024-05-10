import React, { useEffect } from "react";
import { View, Text, FlatList, Image, Pressable } from "react-native";
import { supabase } from "src/utils/supabase";
import { CustomModal } from "src/components/CustomModal";
import {
  Spinner,
  Button,
  Fieldset,
  Input,
  Label,
  AlertDialog,
  YStack,
  XStack,
} from "tamagui";
import { slugify } from "src/utils/slugify";
import { styles } from "./style";
import { useGetWorkspaces, useSaveWorkspace } from "./api";
import { Workspace } from "./models";
import { UseMutationResult } from "@tanstack/react-query";

export default function WorkspacesScreen({ navigation }) {
  const { workspaces, getWorkspacesQuery } = useGetWorkspaces();
  const saveWorkspaceMutation = useSaveWorkspace();
  console.log("WorkspacesScreen: useEffect workspaces: ", workspaces);

  const saveNewTeam = (newTeamName: string) => {
    saveWorkspaceMutation.mutate(newTeamName);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Zespoly</Text>
      <RenderWorkspaces
        workspaces={workspaces}
        navigation={navigation}
        query={getWorkspacesQuery}
      />
      <AddNewTeamDialog mutation={saveWorkspacesMutation} />
      <AddNewTeam saveNewTeam={saveNewTeam} />
    </View>
  );
}

const RenderWorkspaces = ({
  workspaces,
  navigation,
  query,
}: {
  workspaces: Workspace[];
  navigation: any;
  query: any;
}) => {
  return (
    <>
      {query.isPending && <Spinner size="large" />}
      {query.isError && <Text>Cos poszlo nie tak</Text>}
      <FlatList
        data={workspaces}
        renderItem={({ item, index }) => (
          <View>
            <Pressable
              style={styles.project}
              onPress={() => navigation.navigate("Projects", item)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.workspaceName}>
                  {item.personal_account
                    ? `Konto osobiste: ${item.name}`
                    : item.name}
                </Text>
                <View style={{ flex: 1, flexDirection: "row" }}></View>
              </View>
            </Pressable>
          </View>
        )}
      />
    </>
  );
};

const AddNewTeam = ({
  saveNewTeam,
}: {
  saveNewTeam: (newTeamName: string) => void;
}) => {
  const [newTeamName, setNewTeamName] = React.useState<string>("");

  const saveAndClean = () => {
    saveNewTeam(newTeamName);
  };

  return (
    <CustomModal
      onOpenChange={(isOpen) => setNewTeamName("")}
      trigger={
        <Button size="$5" themeInverse={true}>
          Dodaj nowy Zespol
        </Button>
      }
      title={"Dodaj nowy zespol"}
      body={
        <>
          <Fieldset gap="$4" horizontal>
            <Label width={160} justifyContent="flex-end" htmlFor="name">
              Nazwa
            </Label>
            <Input
              flex={1}
              id="name"
              defaultValue=""
              value={newTeamName}
              onChangeText={setNewTeamName}
            />
          </Fieldset>
        </>
      }
      downButtons={
        <Button theme="active" aria-label="Close" onPress={saveAndClean}>
          Dodaj zespol
        </Button>
      }
    />
  );
};

const AddNewTeamDialog = ({
  mutation,
}: {
  mutation: UseMutationResult<void, Error, string, unknown>;
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
                Nowy zespol nie zostal dodany
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
