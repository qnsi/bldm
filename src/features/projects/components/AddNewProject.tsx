import { CustomModal } from "src/components/CustomModal";
import { Image, Text } from "react-native";
import * as ImagePicker from "expo-image-picker";

import { Button, Fieldset, Input, Label } from "tamagui";
import React from "react";
import { styles } from "../styles";

const AddNewProject = ({
  saveProject,
  imageBase64,
  setImageBase64,
}: {
  saveProject: (newProjectName: string) => void;
  imageBase64: string;
  setImageBase64: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const [newProjectName, setNewProjectName] = React.useState<string>("");
  const [image, setImage] = React.useState<string>("");
  const [nameError, setNameError] = React.useState<string>("");
  const [imageError, setImageError] = React.useState<string>("");
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (newProjectName.length > 0) {
      setNameError("");
    }
  }, [newProjectName]);

  React.useEffect(() => {
    if (imageBase64.length > 0) {
      setImageError("");
    }
  }, [imageBase64]);

  const saveNewProject = () => {
    console.log("Saving new project with:");
    console.log("image: ", image);
    console.log("newProjectName: ", newProjectName);
    var validationFailed = false;

    if (newProjectName.length === 0) {
      setNameError("Nazwa projektu nie moze byc pusta");
      validationFailed = true;
    }

    if (imageBase64.length === 0) {
      setImageError("Potrzebujemy miniaturki projektu");
      validationFailed = true;
    }
    if (validationFailed) return;

    setIsOpen(false);
    saveProject(newProjectName);
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
      isOpen={isOpen}
      onOpenChange={(isOpen) => {
        setIsOpen(isOpen);
        setNewProjectName("");
        setImage("");
        setImageBase64("");
        setNameError("");
        setImageError("");
      }}
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
          <Text style={{ color: "red" }}>{nameError}</Text>
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
          <Text style={{ color: "red" }}>{imageError}</Text>
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
