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
} from "react-native";
import { Project } from "./HomeScreen";
import React, { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

import PdfRendererView from "react-native-pdf-renderer";
import { ExpoPdfViewer } from "../modules/expo-pdf-viewer";
import * as FileSystem from "expo-file-system";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { WebView } from "react-native-webview";
import { LongPressGestureHandler, State } from "react-native-gesture-handler";

type Plan = {
  id: number;
  name: string;
  pdfUrl: string;
};

// import from utils/supabase
const supabase = createClient(
  "https://okqjlkjppcfdjjmumweh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rcWpsa2pwcGNmZGpqbXVtd2VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA4NzAxNDUsImV4cCI6MjAyNjQ0NjE0NX0.QjEDBglODFUU0U7Qg1D1dedr3tgUyPwigihvb7Bp-2Y",
);

export default function ProjectScreen({ route, navigation }) {
  const project = route.params as Project;
  const [plans, setPlans] = React.useState<Plan[]>([]);
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

  const debugging = `
  const consoleLog = (type, log) => window.ReactNativeWebView.postMessage(JSON.stringify({'type': 'Console', 'data': {'type': type, 'log': log}}));
  console = {
      log: (log) => consoleLog('log', log),
      debug: (log) => consoleLog('debug', log),
      info: (log) => consoleLog('info', log),
      warn: (log) => consoleLog('warn', log),
      error: (log) => consoleLog('error', log),
    };
`;

  const onMessage = (payload) => {
    let dataPayload;
    try {
      dataPayload = JSON.parse(payload.nativeEvent.data);
    } catch (e) { }

    if (dataPayload) {
      if (dataPayload.type === "Console") {
        console.info(`[Console] ${JSON.stringify(dataPayload.data)}`);
      } else {
        console.log(dataPayload);
      }
    }
  };

  useEffect(() => {
    console.log("ProjectScreen: useEffect, fetching plans");
    supabase
      .from("plans")
      .select()
      .then((result) => {
        console.log("supabase.from(plans): ", result);
        if (result.data === null) return;
        const firstPlan = result.data[0];
        //  LOG  Result:  {"count": null, "data": [{"created_at": "2024-03-19T18:19:39.053546+00:00", "id": 1, "name": "Garwolin main", "pdf_url": "https://okqjlkjppcfdjjmumweh.supabase.co/storage/v1/object/public/plan_pdfs/garwolin-main.pdf?t=2024-03-19T18%3A18%3A19.287Z", "project_id": 1}], "error": null, "status": 200, "statusText": ""}
        setPlans([
          { id: firstPlan.id, name: firstPlan.name, pdfUrl: firstPlan.url },
        ]);
        FileSystem.downloadAsync(
          firstPlan.url,
          FileSystem.documentDirectory + "file.pdf",
        ).then(({ uri }) => {
          console.log("FileSystem.downloadAsync uri: ", uri);
          setFileSource(uri);
        });
      });
  }, [project]);

  useEffect(() => {
    if (plans.length === 0) return;
    fetchPins();
  }, [plans]);

  const fetchPins = () => {
    supabase
      .from("pins")
      .select()
      .eq("plan_id", plans[0].id)
      .then((result) => {
        console.log("supabase.from(pins): ", result);
        // supabase.from(pins):  {"count": null, "data": [{"created_at": "2024-04-19T12:
        // 36:39.053764+00:00",
        // "id": 3, "is_done": false, "note": "Hello world", "plan_id": 1, "task_name": "Hello world", "x": 581.970703125, "y": 1213.865234375}], "error": null, "status": 200, "statusText": ""}
        if (result.data === null) return;
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

  // handles click from native module
  const addPin = (event) => {
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
          plan_id: plans[0].id,
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

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {fileSource && (
        <ExpoPdfViewer
          pins={pins}
          style={{ flex: 1 }}
          addPin={addPin}
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
