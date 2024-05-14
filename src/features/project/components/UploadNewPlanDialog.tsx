import { Text } from "react-native";
import React, { useEffect } from "react";
import { Button as TmgButton, Fieldset, Input, Label } from "tamagui";
import * as DocumentPicker from "expo-document-picker";

import * as FileSystem from "expo-file-system";
import { CustomModal } from "src/components/CustomModal";

export const UploadNewPlanDialog = ({
  upload,
}: {
  upload: (name: string, pdfBase64: string) => void;
}) => {
  const [newPlanName, setNewPlanName] = React.useState("");
  const [pdfBase64, setPdfBase64] = React.useState<string>("");

  const pickPdf = () => {
    // let result = await DocumentPicker.getDocumentAsync({
    //   type: ["application/pdf"],
    //   copyToCacheDirectory: true,
    // });
    DocumentPicker.getDocumentAsync({
      type: ["application/pdf"],
      copyToCacheDirectory: true,
    }).then((result) => {
      console.log("result", result);
      const file = result.assets[0];
      console.log("file", file);
      // FileSystem.readAsStringAsync(file.uri, {
      FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      })
        .then((fileBase64) => {
          setPdfBase64(fileBase64);
        })
        .catch((error) => {
          console.error("Error reading file as string: ", error);
        });
    });

    // if (!result.assets) return;
    // const file = result.assets[0];
    // console.log("pickPdf, file: ", file);
    // console.log("pickPdf, name: ", file.name);
    // setPdfName(file.name);
  };

  const saveNewPlan = () => {
    upload(newPlanName, pdfBase64);
  };

  return (
    <CustomModal
      trigger={
        <TmgButton size="$5" themeInverse={true}>
          Dodaj nowy Plan
        </TmgButton>
      }
      title={"Dodaj nowy plan"}
      body={
        <>
          <Fieldset gap="$4" horizontal>
            <Label width={160} justifyContent="flex-end" htmlFor="name">
              Nazwa Planu
            </Label>
            <Input
              flex={1}
              id="name"
              defaultValue=""
              value={newPlanName}
              onChangeText={setNewPlanName}
            />
          </Fieldset>
          <Fieldset gap="$4" horizontal>
            <Label width={160} justifyContent="flex-end" htmlFor="username">
              <TmgButton onPress={pickPdf}>Pick pdf from file system</TmgButton>
            </Label>
          </Fieldset>
        </>
      }
      downButtons={
        <TmgButton theme="active" aria-label="Close" onPress={saveNewPlan}>
          Dodaj plan
        </TmgButton>
      }
    />
  );
};
