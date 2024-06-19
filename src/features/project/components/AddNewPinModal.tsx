import React from "react";
import { useEffect } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { X } from "@tamagui/lucide-icons";
import { View, Text, Pressable, Modal, TextInput, Switch } from "react-native";
import { modalStyles } from "../styles";
import { SelectLayer } from "./SelectLayer";
import { Dialog, Button, Unspaced } from "tamagui";

export const AddNewPinModal = ({
  isVisible,
  onClose,
  addNewPin,
  autoSelectedLayerId,
  layers,
}) => {
  const [taskName, setTaskName] = React.useState("");
  const [note, setNote] = React.useState("");
  const [isDone, setIsDone] = React.useState(false);

  const [selectedLayerId, setSelectedLayerId] =
    React.useState(autoSelectedLayerId);
  const selectedLayer = layers.find((layer) => layer.id === selectedLayerId);

  const toggleSwitch = () => setIsDone((previousState) => !previousState);

  const save = () => {
    addNewPin(taskName, note, isDone, selectedLayerId);
    setTaskName("");
    setNote("");
    setIsDone(false);
  };
  return (
    <Dialog modal open={isVisible} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          animation="slow"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />

        <Dialog.Content
          bordered
          elevate
          key="content"
          animateOnly={["transform", "opacity"]}
          animation={[
            "lazy",
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          gap="$4"
        >
          <Dialog.Title>Dodaj zadanie</Dialog.Title>
          <SelectLayer
            selectedLayer={selectedLayer}
            layers={layers}
            setSelectedLayerId={setSelectedLayerId}
          />
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
          <Button onPress={save}>Zapisz</Button>
          <Unspaced>
            <Dialog.Close asChild>
              <Button
                position="absolute"
                top="$3"
                right="$3"
                size="$2"
                circular
                icon={X}
              />
            </Dialog.Close>
          </Unspaced>
          {/* ... */}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};
