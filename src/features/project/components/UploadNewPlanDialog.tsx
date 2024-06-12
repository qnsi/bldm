import { Text } from "react-native";
import React, { useEffect } from "react";
import { Button as TmgButton, Fieldset, Input, Label } from "tamagui";
import * as DocumentPicker from "expo-document-picker";

import * as FileSystem from "expo-file-system";
import { CustomModal } from "src/components/CustomModal";
import { styles } from "../styles";
import { Upload } from "@tamagui/lucide-icons";

export const UploadNewPlanDialog = ({
  upload,
  triggerButton,
}: {
  upload: (name: string, pdfBase64: string) => void;
  triggerButton: React.JSX;
}) => {
  const [newPlanName, setNewPlanName] = React.useState("");
  const [pdfBase64, setPdfBase64] = React.useState<string>("");
  const [pdfName, setPdfName] = React.useState<string>("");
  const [nameError, setNameError] = React.useState<string>("");
  const [pdfError, setPdfError] = React.useState<string>("");
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (newPlanName.length > 0) {
      setNameError("");
    }
  }, [newPlanName]);

  React.useEffect(() => {
    if (pdfBase64.length > 0) {
      setPdfError("");
    }
  }, [pdfBase64]);

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
      setPdfName(file.name);
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
    var validationFailed = false;

    if (newPlanName.length === 0) {
      setNameError("Nazwa planu nie moze byc pusta");
      validationFailed = true;
    }

    if (pdfBase64.length === 0) {
      setPdfError("Potrzebujemy planu w formacie pdf");
      validationFailed = true;
    }
    if (validationFailed) return;
    setIsOpen(false);
    upload(newPlanName, pdfBase64);
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onOpenChange={(isOpen) => {
        setIsOpen(isOpen);
        setNewPlanName("");
        setPdfBase64("");
        setNameError("");
        setPdfError("");
      }}
      trigger={triggerButton}
      title={"Dodaj nowy plan"}
      body={
        <>
          <Fieldset gap="$1">
            <Label width={160} justifyContent="flex-end" htmlFor="name">
              Nazwa Planu
            </Label>
            <Input
              id="name"
              defaultValue=""
              value={newPlanName}
              onChangeText={setNewPlanName}
            />
          </Fieldset>
          <Text style={{ color: "red" }}>{nameError}</Text>
          <Fieldset gap="$1" horizontal>
            {pdfBase64 && (
              <>
                <Text style={{ width: 75 }}>{pdfName}</Text>
                <TmgButton
                  width={"75%"}
                  style={{ margin: 20 }}
                  onPress={pickPdf}
                >
                  Wgraj pdf
                </TmgButton>
              </>
            )}
            {!pdfBase64 && (
              <>
                <Upload margin={"$3"} size={"$4"} />
                <TmgButton
                  style={{ margin: 20 }}
                  width={"75%"}
                  onPress={pickPdf}
                >
                  Wgraj pdf
                </TmgButton>
              </>
            )}
          </Fieldset>
          <Text style={{ color: "red" }}>{pdfError}</Text>
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
