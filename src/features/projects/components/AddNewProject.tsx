import { CustomModal } from "src/components/CustomModal";
import { Image } from "react-native";
import * as ImagePicker from "expo-image-picker";

import { Button, Fieldset, Input, Label } from "tamagui";
import React from "react";
import { supabase } from "src/utils/supabase";
import { styles } from "../styles";
import { Workspace } from "../../teams/Workspaces/models";
import { useSaveProject, useUploadProjectThumbnail } from "../api";

const AddNewProject = ({ workspace }: { workspace: Workspace }) => {
  const [newProjectName, setNewProjectName] = React.useState<string>("");
  const [image, setImage] = React.useState<string>("");
  const [imageBase64, setImageBase64] = React.useState<string>("");

  const saveProjectMutation = useSaveProject({
    imageBase64,
    workspaceAccountId: workspace.account_id,
  });

  const saveNewProject = () => {
    console.log("Saving new project with:");
    console.log("image: ", image);
    console.log("newProjectName: ", newProjectName);
    console.log("workspace: ", workspace);

    saveProjectMutation.mutate({
      newProjectName,
      workspaceAccountId: workspace.account_id,
    });
  };

  const pickImage = async () => {
    console.log("pickImage");
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
      base64: true,
    });

    console.log("pickImage, result: ", result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setImageBase64(result.assets[0].base64 || "");
    }
  };

  return (
    <CustomModal
      trigger={
        <Button size="$5" themeInverse={true}>
          Dodaj nowy Projekt
        </Button>
      }
      title={"Dodaj nowy projekt"}
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
              value={newProjectName}
              onChangeText={setNewProjectName}
            />
          </Fieldset>
          <Fieldset gap="$4" horizontal>
            <Label width={160} justifyContent="flex-end" htmlFor="username">
              {image && (
                <Image source={{ uri: image }} style={styles.uploadThumbnail} />
              )}
              <Button onPress={pickImage}>
                Pick an image from camera roll
              </Button>
            </Label>
          </Fieldset>
        </>
      }
      downButtons={
        <Button theme="active" aria-label="Close" onPress={saveNewProject}>
          Dodaj projekt
        </Button>
      }
    />
  );
};

export default AddNewProject;
