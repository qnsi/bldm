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
import { useSession } from "src/utils/sessionContext";
import { supabase } from "src/utils/supabase";
import { CustomModal } from "src/components/CustomModal";
import { Button, Fieldset, Input, Label } from "tamagui";
import { slugify } from "src/utils/slugify";

export type Workspace = {
  name: string;
  account_id: string;
  personal_account: boolean;
};

export default function WorkspacesScreen({ navigation }) {
  const session = useSession();

  const [workspaces, setWorkspaces] = React.useState<Workspace[]>([]);
  const [newTeamName, setNewTeamName] = React.useState<string>("");

  useEffect(() => {
    console.log("WorkspacesScreen: useEffect fetching workspaces");
    console.log("session.user.id: ", session?.user.id);

    if (session && session.user.id !== null) {
      supabase.rpc("get_accounts").then((result) => {
        console.log(
          "WorkspacesScreen: useEffect get_accounts fetching result: ",
          result,
        );
        // result:  {"count": null, "data": [{"created_at": "2024-03-19T18:03:44.38948+00:00", "id": 1, "name": "Garwolin", "thumbnail_url": "https://okqjlkjppcfdjjmumweh.supabase.co/storage/v1/object/sign/plan_thumbnails/Garwolin.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwbGFuX3RodW1ibmFpbHMvR2Fyd29saW4uanBnIiwiaWF0IjoxNzEwODcxMzI5LCJleHAiOjIwMjYyMzEzMjl9.GO-14NIxlxtdcQCvOnGK9G8RuQTxIL7aD8IRKmKFHD0"}], "error": null, "status": 200, "statusText": ""}
        if (result.data === null) return;
        setWorkspaces(
          result.data.map((workspace) => {
            return {
              name: workspace.name,
              account_id: workspace.account_id,
              personal_account: workspace.personal_account,
            };
          }),
        );
      });
    }
  }, []);

  const saveNewTeam = () => {
    console.log("Saving new team with:");
    console.log("newTeamName: ", newTeamName);

    supabase
      .rpc("create_account", {
        name: newTeamName,
        slug: slugify(newTeamName),
      })
      .then(({ data, error }) => {
        console.log("create_account, data: ", data);
        console.log("create_account, error: ", error);
      });
  };

  useEffect(() => {
    console.log("WorkspacesScreen: useEffect workspaces: ", workspaces);
  }, [workspaces]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Zespoly</Text>
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
      <CustomModal
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
          <Button theme="active" aria-label="Close" onPress={saveNewTeam}>
            Dodaj zespol
          </Button>
        }
      />
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
  workspaceName: {
    fontWeight: "bold",
    fontSize: 20,
    marginTop: 5,
    marginLeft: 10,
  },
  thumbnail: {
    height: 50,
    width: 50,
    borderRadius: 10,
  },
});
