import { DropdownElement, HeaderRight } from "src/components/DropdownMenu";
import { CustomModal } from "src/components/CustomModal";
import { Button } from "tamagui";
import * as Clipboard from "expo-clipboard";
import { Pressable, Text } from "react-native";
import { supabase } from "src/utils/supabase";
import React from "react";
import { useGetInvitationLink } from "../api";

export const ProjectsHeader = ({
  workspaceAccountId,
}: {
  workspaceAccountId: string;
}) => {
  const { invitationLink, getInvitationLinkQuery } =
    useGetInvitationLink(workspaceAccountId);

  return (
    <HeaderRight
      dropDownElements={
        <>
          <DropdownElement
            onPress={() => supabase.auth.signOut()}
            text={"Sign out"}
          />
          <CustomModal
            trigger={
              <Pressable>
                <Text>Dodaj osoby do zespołu</Text>
              </Pressable>
            }
            title={"Dodaj osoby do zespolu"}
            body={
              <>
                <Text>{invitationLink}</Text>
                <Button
                  onPress={() => Clipboard.setStringAsync(invitationLink)}
                >
                  Skopiuj link
                </Button>
              </>
            }
            downButtons={<></>}
          />
        </>
      }
    />
  );
};
