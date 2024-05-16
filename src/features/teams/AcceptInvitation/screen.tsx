import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { supabase } from "src/utils/supabase";
import { styles } from "./styles";
import { useAcceptInvitation } from "./api";

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

  const acceptInvitationMutation = useAcceptInvitation();

  useEffect(() => {
    acceptInvitationMutation.mutate(token);
  }, []);

  return (
    <View style={styles.container}>
      {acceptInvitationMutation.isError ? (
        <Text style={{ color: "red" }}>
          Coś poszło nie tak. Spróbuj ponownie
        </Text>
      ) : acceptInvitationMutation.isSuccess ? (
        <Text style={{ color: "green" }}>Zaproszenie zaakceptowane</Text>
      ) : (
        <Text style={styles.header}>Akceptowanie zaproszenia...</Text>
      )}
    </View>
  );
}
