import React from "react";
import { useEffect } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  Switch,
  Button,
} from "react-native";
import { modalStyles } from "../styles";

export const EditPinModal = ({
  isVisible,
  onClose,
  updatePin,
  pinId,
  pins,
}) => {
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
