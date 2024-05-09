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

export type Workspace = {
  name: string;
  account_id: string;
  personal_account: boolean;
};

export default function AcceptInviteScreen({ route, navigation }) {
  const [error, setError] = React.useState<string>("");
  const [success, setSuccess] = React.useState<boolean>(false);

  console.log("token: ", route.params.token);
  const token = route.params.token;
  const session = useSession();

  useEffect(() => {
    supabase
      .rpc("accept_invitation", {
        lookup_invitation_token: token,
      })
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
          return;
        }
        setSuccess(true);
      });
  }, []);

  return (
    <View style={styles.container}>
      {error ? (
        <Text style={{ color: "red" }}>{error}</Text>
      ) : success ? (
        <Text style={{ color: "green" }}>Zaproszenie zaakceptowane</Text>
      ) : (
        <Text style={styles.header}>Akceptowanie zaproszenia...</Text>
      )}
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
