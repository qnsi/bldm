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
  deleteWorkspace,
  dropdownVisible,
  setDropdownVisible,
}: {
  workspaceAccountId: string;
  deleteWorkspace: () => void;
  dropdownVisible: boolean;
  setDropdownVisible: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { invitationLink, getInvitationLinkQuery } =
    useGetInvitationLink(workspaceAccountId);

  return (
    <HeaderRight
      dropdownVisible={dropdownVisible}
      setDropdownVisible={setDropdownVisible}
      dropDownElements={
        <>
          <DropdownElement
            onPress={() => supabase.auth.signOut()}
            text={"Sign out"}
          />
          <CustomModal
            trigger={
              <DropdownElement
                onPress={() => { }}
                text={"Dodaj do zespołu"}
              ></DropdownElement>
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
          <CustomModal
            trigger={
              <DropdownElement
                onPress={() => { }}
                text={"Usun zespol"}
              ></DropdownElement>
            }
            title={"Czy na pewno chcesz usunac zespol?"}
            body={
              <>
                <Button onPress={deleteWorkspace}>Usun zespol</Button>
              </>
            }
            downButtons={<></>}
          />
        </>
      }
    />
  );
};
