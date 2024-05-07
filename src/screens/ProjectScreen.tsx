import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Pressable,
  Modal,
  TextInput,
  Switch,
  Button,
  Image,
} from "react-native";
import { Project } from "./ProjectsScreen";
import React, { useEffect } from "react";
import {
  Button as TmgButton,
  Fieldset,
  Input,
  Label,
  Adapt,
  Select,
  Sheet,
  XStack,
  YStack,
  getFontSize,
} from "tamagui";
import { Check, ChevronDown } from "@tamagui/lucide-icons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

import PdfRendererView from "react-native-pdf-renderer";
import { ExpoPdfViewer } from "../../modules/expo-pdf-viewer";
import * as FileSystem from "expo-file-system";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { WebView } from "react-native-webview";
import { LongPressGestureHandler, State } from "react-native-gesture-handler";
import { supabase } from "../../utils/supabase";
import { CustomModal } from "../components/CustomModal";
import { Workspace } from "./WorkspacesScreen";
import { decode } from "base64-arraybuffer";

type Plan = {
  id: number;
  name: string;
};

export default function ProjectScreen({ route, navigation }) {
  const project = route.params.project as Project;
  const workspace = route.params.workspace as Workspace;
  const [plans, setPlans] = React.useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = React.useState<number>(0);
  const [fileSource, setFileSource] = React.useState<string>();
  const [pins, setPins] = React.useState<
    {
      id: number;
      x: number;
      y: number;
      taskName: string;
      note: string;
      isDone: boolean;
      planId: number;
    }[]
  >([]);
  const [isVisible, setIsVisible] = React.useState(false);
  const [newPin, setNewPin] = React.useState<{ x: number; y: number }>();
  const [editingPinId, setEditingPinId] = React.useState(0);
  const [editingPinVisible, setEditingPinVisible] = React.useState(false);
  const [hackKey, setHackKey] = React.useState(0);
  const [dropdownVisible, setDropdownVisible] = React.useState(false);

  const screenOptions = {
    headerRight: () => (
      <>
        <Pressable
          style={
            StyleSheet.create({ pressable: { paddingRight: 20 } }).pressable
          }
          onPress={() => setDropdownVisible((prev) => !prev)}
        >
          <Text>...</Text>
        </Pressable>
        <DropdownMenu
          isVisible={dropdownVisible}
          removeProject={removeProject}
        />
      </>
    ),
  };

  useEffect(() => {
    navigation.setOptions(screenOptions);
  }, [navigation, dropdownVisible]);

  useEffect(() => {
    console.log("ProjectScreen: useEffect, fetching plans");
    supabase
      .from("plans")
      .select()
      .eq("project_id", project.id)
      .then((plansResult) => {
        console.log("supabase.from(plans): ", plansResult);
        if (plansResult.data === null) return;
        const firstPlan = plansResult.data[0];
        setSelectedPlanId(firstPlan.id);
        //  LOG  Result:  {"count": null, "data": [{"created_at": "2024-03-19T18:19:39.053546+00:00", "id": 1, "name": "Garwolin main", "pdf_url": "https://okqjlkjppcfdjjmumweh.supabase.co/storage/v1/object/public/plan_pdfs/garwolin-main.pdf?t=2024-03-19T18%3A18%3A19.287Z", "project_id": 1}], "error": null, "status": 200, "statusText": ""}
        setPlans((plans) => {
          return plansResult.data.map((plan) => {
            return {
              id: plan.id,
              name: plan.name || "Nienazwany plan",
            } as Plan;
          });
        });
      });
  }, [project]);

  useEffect(() => {
    if (selectedPlanId === 0 || plans.length === 0) return;
    fetchPlanPdf();
  }, [selectedPlanId, plans]);

  useEffect(() => {
    if (!fileSource) return;
    setHackKey((prev) => prev + 1);
  }, [fileSource]);

  const fetchPlanPdf = () => {
    console.log("fetchPlanPdf, selectedPlanId: ", selectedPlanId);
    console.log("fetchPlanPdf, workspace.uuid: ", workspace.uuid);
    // TODO: Don't fetch and save all the time the same pdf
    supabase.storage
      .from("plan_pdfs")
      .download(`${workspace.account_id}/${project.id}/${selectedPlanId}.pdf`)
      .then((storageResult) => {
        console.log("storageResult: ", storageResult);

        const fr = new FileReader();
        fr.onload = async () => {
          const fileUri = `${FileSystem.documentDirectory}/${selectedPlanId}.pdf`;
          await FileSystem.writeAsStringAsync(
            fileUri,
            fr.result.split(",")[1],
            { encoding: FileSystem.EncodingType.Base64 },
          );
          setFileSource(fileUri);
          setPins([]);
          fetchPins();
        };
        fr.readAsDataURL(storageResult.data);
      });
  };

  const fetchPins = () => {
    supabase
      .from("pins")
      .select()
      .eq("plan_id", selectedPlanId)
      .then((result) => {
        console.log("supabase.from(pins): ", result);
        // supabase.from(pins):  {"count": null, "data": [{"created_at": "2024-04-19T12:
        // 36:39.053764+00:00",
        // "id": 3, "is_done": false, "note": "Hello world", "plan_id": 1, "task_name": "Hello world", "x": 581.970703125, "y": 1213.865234375}], "error": null, "status": 200, "statusText": ""}
        setPins(
          result.data.map((pin) => ({
            id: pin.id,
            isDone: pin.is_done,
            note: pin.note,
            planId: pin.plan_id,
            taskName: pin.task_name,
            x: pin.x,
            y: pin.y,
          })),
        );
        // setPlans([
        //   { id: firstPlan.id, name: firstPlan.name, pdfUrl: firstPlan.url },
        // ]);
      });
  };

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
          // TODO:
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

  const removeProject = () => {
    supabase
      .from("projects")
      .delete()
      .eq("id", project.id)
      .then((result) => {
        console.log("delete project result: ", result);
        console.log(
          "trying to delete all project files",
          `${workspace.account_id}/${project.id}.png`,
        );
        supabase.storage
          .from("plan_thumbnails")
          .remove([`${workspace.account_id}/${project.id}.png`])
          .then((result) => {
            console.log("remove result: ", result);
          });
        console.log(
          "trying to delete all plans files",
          `${workspace.account_id}/${project.id}`,
        );
        supabase.storage
          .from("plan_pdfs")
          .list(`${workspace.account_id}/${project.id}`)
          .then(({ data, error }) => {
            console.log("get plan_pdfs data: ", data);
            console.log("get plan_pdfs error: ", error);
            const filesToRemove = data.map(
              (x) => `${workspace.account_id}/${project.id}/${x.name}`,
            );
            supabase.storage
              .from("plan_pdfs")
              .remove(filesToRemove)
              .then((result) => {
                console.log("remove plan_pdfs: result: ", result);
              });
          });
      });
  };

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <UploadNewPlanDialog upload={uploadNewPlan} />
      <SelectPlan
        selectedPlan={selectedPlan}
        plans={plans}
        setSelectedPlanId={setSelectedPlanId}
      />

      {fileSource && (
        <ExpoPdfViewer
          key={hackKey}
          pins={pins}
          style={{ flex: 1 }}
          addPin={handleLongTap}
          clickPin={clickPin}
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

const SelectPlan = ({
  selectedPlan,
  plans,
  setSelectedPlanId,
}: {
  selectedPlan?: Plan;
  plans: Plan[];
  setSelectedPlanId: (value: React.SetStateAction<number>) => void;
}) => {
  const setVal = (val) => {
    const newPlan = plans.find((plan) => plan.name === val);
    if (newPlan) setSelectedPlanId(newPlan.id);
  };

  if (!selectedPlan || plans.length === 0 || !Array.isArray(plans)) {
    return <Text>Loading...</Text>;
  }
  return (
    <Select
      value={selectedPlan.name}
      onValueChange={setVal}
      disablePreventBodyScroll
    >
      <Select.Trigger width={220} iconAfter={ChevronDown}>
        <Select.Value placeholder="Something" />
      </Select.Trigger>

      <Adapt when="sm" platform="touch">
        <Sheet
          modal
          dismissOnSnapToBottom
          animationConfig={{
            type: "spring",
            damping: 20,
            mass: 1.2,
            stiffness: 250,
          }}
        >
          <Sheet.Frame>
            <Sheet.ScrollView>
              <Adapt.Contents />
            </Sheet.ScrollView>
          </Sheet.Frame>
          <Sheet.Overlay
            animation="lazy"
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
        </Sheet>
      </Adapt>

      <Select.Content zIndex={200000}>
        <Select.Viewport
          // to do animations:
          // animation="quick"
          // animateOnly={['transform', 'opacity']}
          // enterStyle={{ o: 0, y: -10 }}
          // exitStyle={{ o: 0, y: 10 }}
          minWidth={200}
        >
          <Select.Group>
            <Select.Label>Plans</Select.Label>
            {plans.map((plan, i) => {
              return (
                <Select.Item index={i} key={plan.id} value={plan.name}>
                  <Select.ItemText>{plan.name}</Select.ItemText>
                  <Select.ItemIndicator marginLeft="auto">
                    <Check size={16} />
                  </Select.ItemIndicator>
                </Select.Item>
              );
            })}
          </Select.Group>
        </Select.Viewport>
      </Select.Content>
    </Select>
  );
};

const UploadNewPlanDialog = ({
  upload,
}: {
  upload: (name: string, pdfBase64: string) => void;
}) => {
  const [newPlanName, setNewPlanName] = React.useState("");
  const [pdfName, setPdfName] = React.useState("");
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
              {pdfName && <Text>{pdfName}</Text>}
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

const AddNewPinModal = ({ isVisible, onClose, addNewPin }) => {
  const [taskName, setTaskName] = React.useState("");
  const [note, setNote] = React.useState("");
  const [isDone, setIsDone] = React.useState(false);
  const toggleSwitch = () => setIsDone((previousState) => !previousState);

  const save = () => {
    addNewPin(taskName, note, isDone);
    setTaskName("");
    setNote("");
    setIsDone(false);
  };
  return (
    <Modal animationType="slide" transparent={true} visible={isVisible}>
      <View style={modalStyles.modal}>
        <View style={modalStyles.modalView}>
          <View style={modalStyles.titleContainer}>
            <Text>Dodaj nowe zadanie</Text>
            <Pressable onPress={onClose}>
              <MaterialIcons name="close" color="#000" size={22} />
            </Pressable>
          </View>
          <Text>Nazwa zadania</Text>
          <TextInput
            style={modalStyles.input}
            onChangeText={setTaskName}
            value={taskName}
          />
          <Text>Uwagi</Text>
          <TextInput
            style={modalStyles.noteInput}
            onChangeText={setNote}
            value={note}
            multiline={true}
          />
          <View style={modalStyles.isDone}>
            <Text>Oznacz jako zrobione</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={isDone ? "#6090dd" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleSwitch}
              value={isDone}
            />
          </View>
          <Button title="Zapisz" onPress={save} />
        </View>
      </View>
    </Modal>
  );
};

const EditPinModal = ({ isVisible, onClose, updatePin, pinId, pins }) => {
  const [taskName, setTaskName] = React.useState("");
  const [note, setNote] = React.useState("");
  const [isDone, setIsDone] = React.useState(false);
  const toggleSwitch = () => setIsDone((previousState) => !previousState);

  useEffect(() => {
    const pin = pins.find((pin) => pin.id === pinId);
    if (pin) {
      setTaskName(pin.taskName);
      setNote(pin.note);
      setIsDone(pin.isDone);
    }
  }, [pinId, pins]);

  const save = () => {
    updatePin(taskName, note, isDone);
    setTaskName("");
    setNote("");
    setIsDone(false);
  };
  return (
    <Modal animationType="slide" transparent={true} visible={isVisible}>
      <View style={modalStyles.modal}>
        <View style={modalStyles.modalView}>
          <View style={modalStyles.titleContainer}>
            <Text>Dodaj nowe zadanie</Text>
            <Pressable onPress={onClose}>
              <MaterialIcons name="close" color="#000" size={22} />
            </Pressable>
          </View>
          <Text>Nazwa zadania</Text>
          <TextInput
            style={modalStyles.input}
            onChangeText={setTaskName}
            value={taskName}
          />
          <Text>Uwagi</Text>
          <TextInput
            style={modalStyles.noteInput}
            onChangeText={setNote}
            value={note}
            multiline={true}
          />
          <View style={modalStyles.isDone}>
            <Text>Oznacz jako zrobione</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={isDone ? "#6090dd" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleSwitch}
              value={isDone}
            />
          </View>
          <Button title="Zapisz" onPress={save} />
        </View>
      </View>
    </Modal>
  );
};

const DropdownMenu = ({
  isVisible,
  removeProject,
}: {
  isVisible: boolean;
  removeProject: () => void;
}) => {
  if (!isVisible) return null;

  return (
    <View style={dropdownStyles.dropdown}>
      <Pressable
        onPress={() => supabase.auth.signOut()}
        style={dropdownStyles.dropdownItem}
      >
        <Text>Sign Out</Text>
      </Pressable>
      <Pressable onPress={removeProject} style={dropdownStyles.dropdownItem}>
        <Text>Remove Project</Text>
      </Pressable>
    </View>
  );
};

const dropdownStyles = StyleSheet.create({
  dropdown: {
    position: "absolute",
    right: 10,
    top: 50,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
  },
  dropdownItem: {
    padding: 10,
  },
});

const modalStyles = StyleSheet.create({
  modal: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalView: {
    height: "60%",
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 20,
  },
  titleContainer: {
    height: "16%",
    backgroundColor: "#ddd",
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  noteInput: {
    height: 100,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  isDone: {
    display: "flex",
    alignSelf: "flex-start",
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 25,
  },
  pdf: {
    flex: 1,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});
