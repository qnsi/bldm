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
import { styles } from "./styles";
import { useGetWorkspaces, useSaveWorkspace } from "./api";
import { Workspace } from "./models";
import { UseMutationResult } from "@tanstack/react-query";
import { DropdownElement, HeaderRight } from "src/components/DropdownMenu";
import Avatar from "./components/Avatar";

export default function WorkspacesScreen({ navigation }) {
  const { workspaces, getWorkspacesQuery } = useGetWorkspaces();
  const [dropdownVisible, setDropdownVisible] = React.useState(false);
  const saveWorkspaceMutation = useSaveWorkspace();
  console.log("WorkspacesScreen: useEffect workspaces: ", workspaces);

  const saveNewTeam = (newTeamName: string) => {
    saveWorkspaceMutation.mutate(newTeamName);
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderRight
          dropdownVisible={dropdownVisible}
          setDropdownVisible={setDropdownVisible}
          dropDownElements={
            <DropdownElement
              onPress={() => supabase.auth.signOut()}
              text={"Sign out"}
            />
          }
        />
      ),
    });
  }, [navigation, dropdownVisible, setDropdownVisible]);

  return (
    <View
      style={styles.container}
      onTouchStart={() => setDropdownVisible(false)}
    >
      <Text style={styles.header}>Zespoly</Text>
      <RenderWorkspaces
        workspaces={workspaces}
        navigation={navigation}
        query={getWorkspacesQuery}
      />
      <AddNewTeamDialog mutation={saveWorkspaceMutation} />
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
              <Avatar teamName={item.name} />
              <Text style={styles.workspaceName}>
                {item.personal_account
                  ? `Konto osobiste: ${item.name}`
                  : item.name}
              </Text>
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
  const [error, setError] = React.useState<string>("");
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  useEffect(() => {
    if (newTeamName.length > 0) {
      setError("");
    }
  }, [newTeamName]);

  const saveAndClean = () => {
    if (newTeamName.length === 0) {
      setError("Nazwa zespolu nie moze byc pusta");
      return;
    }
    setIsOpen(false);
    saveNewTeam(newTeamName);
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onOpenChange={(isOpen) => {
        setIsOpen(isOpen);
        setNewTeamName("");
        setError("");
      }}
      trigger={
        <Button style={styles.addNewTeamButton} size="$5" themeInverse={true}>
          Dodaj nowy Zespol
        </Button>
      }
      title={"Dodaj nowy zespol"}
      body={
        <>
          <Fieldset gap="$1">
            <Label justifyContent="flex-end" htmlFor="name">
              Nazwa
            </Label>
            <Input
              id="name"
              defaultValue=""
              value={newTeamName}
              onChangeText={setNewTeamName}
            />
          </Fieldset>
          <Text style={{ color: "red" }}>{error}</Text>
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
