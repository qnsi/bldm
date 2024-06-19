import { SafeAreaView, Text, View } from "react-native";
import React, { useEffect } from "react";

import { ExpoPdfViewer } from "modules/expo-pdf-viewer";
import { supabase } from "src/utils/supabase";
import { decode } from "base64-arraybuffer";
import { Project } from "../projects/model";
import { Workspace } from "../teams/Workspaces/models";
import { Pin, hardcodeLayers } from "./models";
import { useHeader } from "./hooks/useHeader";
import { EditPinModal } from "./components/EditPinModal";
import { AddNewPinModal } from "./components/AddNewPinModal";
import { UploadNewPlanDialog } from "./components/UploadNewPlanDialog";
import { useFetchPlanPdf, useGetPlans } from "./api";
import { SelectPlan } from "./components/SelectPlan";
import { SelectLayer } from "./components/SelectLayer";
import { ToggleDone } from "./components/ToggleDone";
import { useQueryClient } from "@tanstack/react-query";
import { Button, Spinner, XStack, YStack } from "tamagui";
import { styles } from "./styles";

export default function ProjectScreen({ route, navigation }) {
  const project = route.params.project as Project;
  const workspace = route.params.workspace as Workspace;
  const [selectedPlanId, setSelectedPlanId] = React.useState<number>(0);
  const [fileSource, setFileSource] = React.useState<string>();
  const [pins, setPins] = React.useState<Pin[]>([]);
  const [isVisible, setIsVisible] = React.useState(false);
  const [newPin, setNewPin] = React.useState<{ x: number; y: number }>();
  const [editingPinId, setEditingPinId] = React.useState(0);
  const [editingPinVisible, setEditingPinVisible] = React.useState(false);
  const [showDone, setShowDone] = React.useState(true);
  const [hackKey, setHackKey] = React.useState(0);

  const queryClient = useQueryClient();
  const setDropdownVisible = useHeader(navigation, project, workspace);
  const { plans, getPlansQuery } = useGetPlans(project);
  const { fetchPins } = useFetchPlanPdf(
    plans,
    selectedPlanId,
    setSelectedPlanId,
    workspace,
    project,
    setFileSource,
    setPins,
  );

  const [selectedLayerId, setSelectedLayerId] = React.useState<number>(0);
  const layers = hardcodeLayers;

  useEffect(() => {
    if (!fileSource) return;
    // we want to remount pdf viewer every time file source changes
    setHackKey((prev) => prev + 1);
  }, [fileSource, selectedLayerId, showDone]);

  const PdfResource = {
    uri: fileSource,
    cache: false,
  };
  // return <ExpoPdfViewer name="Hello" />;

  // handles click from native module and opens dialog
  const handleLongTap = (event) => {
    console.log("addPin, event: ", event.nativeEvent);
    const x = event.nativeEvent.data.x;
    const y = event.nativeEvent.data.y;
    setNewPin({ x, y });
    setPins((pins) => pins.concat([{ x, y } as Pin]));
    setIsVisible(true);
  };

  const addNewPin = (taskName, note, isDone, selectedLayerId) => {
    if (!newPin) return;
    supabase
      .from("pins")
      .insert([
        {
          x: newPin.x,
          y: newPin.y,
          task_name: taskName,
          note,
          is_done: isDone,
          layer_id: selectedLayerId,
          plan_id: selectedPlanId,
        },
      ])
      .then((result) => {
        console.log("Insert result: ", result);
        fetchPins();
      });
    // setPins((pins) => [...pins, newPin]);
    setNewPin(undefined);
    setIsVisible(false);
  };

  const updatePin = (
    pinId: number,
    taskName: string,
    note: string,
    isDone: boolean,
    layerId: number,
  ) => {
    console.log("updatePin, pinId: ", pinId);
    console.log("updatePin, taskName: ", taskName);
    console.log("updatePin, note: ", note);
    console.log("updatePin, isDone: ", isDone);
    console.log("updatePin, layerId: ", layerId);
    supabase
      .from("pins")
      .update([
        {
          task_name: taskName,
          note,
          is_done: isDone,
          layer_id: layerId,
        },
      ])
      .eq("id", pinId)
      .then((result) => {
        console.log("Update result: ", result);
        fetchPins();
      });
    setEditingPinVisible(false);
  };

  const clickPin = (event) => {
    console.log("removePin, event: ", event.nativeEvent);
    const x = event.nativeEvent.data.x;
    const y = event.nativeEvent.data.y;
    if (event) {
      console.log("removePin, event: ", event.nativeEvent);
      setEditingPinId(pins.find((pin) => pin.x == x && pin.y == y)?.id || 0);
      setEditingPinVisible(true);
    }
  };

  const onClose = () => {
    setIsVisible(false);
    setEditingPinVisible(false);
  };

  const uploadNewPlan = (name: string, pdfBase64: string) => {
    supabase
      .from("plans")
      .insert([
        {
          name,
          project_id: project.id,
        },
      ])
      .select()
      .then((result) => {
        console.log("insert into plans result: ", result);
        console.log("workspace: ", workspace);
        console.log(
          "trying to upload into: ",
          `${workspace.account_id}/${project.id}/${result.data[0].id}.pdf`,
        );
        supabase.storage
          .from("plan_pdfs")
          .upload(
            `${workspace.account_id}/${project.id}/${result.data[0].id}.pdf`,
            decode(pdfBase64),
            {
              contentType: "application/pdf",
            },
          )
          .then((result) => {
            console.log("File upload, result: ", result);
            queryClient.invalidateQueries({ queryKey: ["plans"] });
          });
      });
  };

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId);
  const selectedLayer = layers.find((layer) => layer.id === selectedLayerId);

  const pinsForLayer =
    selectedLayerId === 0
      ? pins
      : pins.filter((pin) => pin.layer_id === selectedLayerId);

  const pinsForLayerAndChecked = showDone
    ? pinsForLayer
    : pinsForLayer.filter((pin) => !pin.isDone);

  console.log("showDone: ", showDone);
  console.log("pinsForLayerAndChecked: ", pinsForLayerAndChecked);
  console.log("pins: ", pins);
  console.log("pinsForLayer: ", pinsForLayer);
  console.log("selectedLayerId: ", selectedLayerId);

  return (
    <SafeAreaView
      style={styles.container}
      onTouchStart={() => setDropdownVisible(false)}
    >
      {getPlansQuery.isLoading && <Spinner size={"large"} />}
      {getPlansQuery.isError && <Text>Cos poszlo nie tak</Text>}
      {getPlansQuery.isFetched && plans.length === 0 && (
        <YStack
          style={{ flex: 1, justifyContent: "center" }}
          alignItems={"center"}
        >
          <Text style={{ marginBottom: 20, fontSize: 20 }}>
            Brak planow do wyswietlenia.
          </Text>
          <UploadNewPlanDialog
            upload={uploadNewPlan}
            triggerButton={
              <Button
                style={styles.addNewPlanButton}
                size="$5"
                themeInverse={true}
              >
                Dodaj nowy Plan
              </Button>
            }
          />
        </YStack>
      )}
      {getPlansQuery.isFetched && plans.length > 0 && (
        <>
          <View style={styles.formContainer}>
            <SelectPlan
              selectedPlan={selectedPlan}
              plans={plans}
              setSelectedPlanId={setSelectedPlanId}
              uploadNewPlan={uploadNewPlan}
            />
            <SelectLayer
              selectedLayer={selectedLayer}
              layers={layers}
              setSelectedLayerId={setSelectedLayerId}
            />
            <ToggleDone showDone={showDone} setShowDone={setShowDone} />
          </View>
          {fileSource && (
            <ExpoPdfViewer
              key={hackKey}
              pins={pinsForLayerAndChecked}
              style={{ flex: 1 }}
              onAddPin={handleLongTap}
              onClickPin={clickPin}
              fileSource={fileSource}
              name="Hello"
            />
          )}
          <AddNewPinModal
            autoSelectedLayerId={selectedLayerId}
            layers={layers}
            isVisible={isVisible}
            onClose={onClose}
            addNewPin={addNewPin}
          />
          <EditPinModal
            isVisible={editingPinVisible}
            pinId={editingPinId}
            pins={pins}
            layers={layers}
            onClose={onClose}
            updatePin={updatePin}
          />
        </>
      )}
    </SafeAreaView>
  );
}
