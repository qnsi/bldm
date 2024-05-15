import { SafeAreaView } from "react-native";
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
  const [hackKey, setHackKey] = React.useState(0);

  useHeader(navigation, project, workspace);
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
  }, [fileSource, selectedLayerId]);

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
    setIsVisible(true);
  };

  const addNewPin = (taskName, note, isDone) => {
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
          });
      });
  };

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId);
  const selectedLayer = layers.find((layer) => layer.id === selectedLayerId);

  const pinsForLayer =
    selectedLayerId === 0
      ? pins
      : pins.filter((pin) => pin.layer_id === selectedLayerId);

  console.log("pins: ", pins);
  console.log("pinsForLayer: ", pinsForLayer);
  console.log("selectedLayerId: ", selectedLayerId);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <UploadNewPlanDialog upload={uploadNewPlan} />
      <SelectPlan
        selectedPlan={selectedPlan}
        plans={plans}
        setSelectedPlanId={setSelectedPlanId}
      />
      <SelectLayer
        selectedLayer={selectedLayer}
        layers={layers}
        setSelectedLayerId={setSelectedLayerId}
      />

      {fileSource && (
        <ExpoPdfViewer
          key={hackKey}
          pins={pinsForLayer}
          style={{ flex: 1 }}
          onAddPin={handleLongTap}
          onClickPin={clickPin}
          fileSource={fileSource}
          name="Hello"
        />
      )}
      <AddNewPinModal
        isVisible={isVisible}
        onClose={onClose}
        addNewPin={addNewPin}
      />
      <EditPinModal
        isVisible={editingPinVisible}
        pinId={editingPinId}
        pins={pins}
        onClose={onClose}
        updatePin={() => { }}
      />
    </SafeAreaView>
  );
}
