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
import { useSession } from "../utils/sessionContext";
import { supabase } from "../utils/supabase";

export type Workspace = {
  name: string;
  id: number;
};

export type UserWorkspace = {
  user_email: string;
  workspace_id: number;
};

export default function WorkspacesScreen({ navigation }) {
  const [userWorkspaces, setUserWorkspaces] = React.useState<UserWorkspace[]>(
    [],
  );
  const [workspaces, setWorkspaces] = React.useState<Workspace[]>([]);
  const session = useSession();

  useEffect(() => {
    console.log("WorkspacesScreen: useEffect fetching workspaces");
    console.log("session.user.id: ", session?.user.id);

    if (session && session.user.id !== null) {
      supabase
        .from("users_workspaces") // Join table
        .select(
          `
                workspace_id,
                user_email,
                workspaces (
                    id,
                    name
                )
            `,
        )
        // .then((result) => {
        .then((result) => {
          console.log(
            "WorkspacesScreen: useEffect workspaces fetching result: ",
            result,
          );
          // result:  {"count": null, "data": [{"created_at": "2024-03-19T18:03:44.38948+00:00", "id": 1, "name": "Garwolin", "thumbnail_url": "https://okqjlkjppcfdjjmumweh.supabase.co/storage/v1/object/sign/plan_thumbnails/Garwolin.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwbGFuX3RodW1ibmFpbHMvR2Fyd29saW4uanBnIiwiaWF0IjoxNzEwODcxMzI5LCJleHAiOjIwMjYyMzEzMjl9.GO-14NIxlxtdcQCvOnGK9G8RuQTxIL7aD8IRKmKFHD0"}], "error": null, "status": 200, "statusText": ""}
          if (result.data === null) return;
          setUserWorkspaces(
            result.data?.map((uw) => {
              console.log("usedsworkspaces.workspaces: ", uw);
              return {
                user_email: uw.user_email,
                workspace_id: uw.workspace_id,
              } as UserWorkspace;
            }),
          );
          const uniqueWorkspaces = [
            ...new Map(
              result.data.map((userWorkspace) => [
                userWorkspace["workspace_id"],
                userWorkspace.workspaces,
              ]),
            ).values(),
          ];
          console.log("uniqueWorkspace: ", uniqueWorkspaces);
          setWorkspaces(uniqueWorkspaces as Workspace[]);
        });
    }
  }, []);

  React.useEffect(() => {
    console.log("userWorksapces: ", userWorkspaces);
  }, [userWorkspaces]);

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
                <Text style={styles.workspaceName}>{item.name}</Text>
                <View style={{ flex: 1, flexDirection: "row" }}>
                  {userWorkspaces
                    .filter((uw) => uw.workspace_id === item.id)
                    .map((uw) => (
                      <Text>{uw.user_email + " "}</Text>
                    ))}
                </View>
              </View>
            </Pressable>
          </View>
        )}
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
