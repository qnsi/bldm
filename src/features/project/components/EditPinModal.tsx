import React from "react";
import { useEffect } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { View, Text, Pressable, Modal, TextInput, Switch } from "react-native";
import { modalStyles } from "../styles";
import { Layer, Pin } from "../models";
import { Dialog, Button, Unspaced } from "tamagui";
import { X } from "@tamagui/lucide-icons";
import { SelectLayer } from "./SelectLayer";
import { colors } from "src/styles/colors";
import { CustomModal } from "src/components/CustomModal";

export const EditPinModal = ({
  isVisible,
  onClose,
  updatePin,
  deletePin,
  pinId,
  pins,
  layers,
}: {
  isVisible: boolean;
  onClose: () => void;
  pinId: number;
  pins: Pin[];
  updatePin: (
    pinId: any,
    taskName: any,
    note: any,
    isDone: any,
    layerId: number,
  ) => void;
  deletepin: (pinId: number) => void;
  layers: Layer[];
}) => {
  const [taskName, setTaskName] = React.useState("");
  const [note, setNote] = React.useState("");
  const [isDone, setIsDone] = React.useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = React.useState(false);
  const [selectedLayerId, setSelectedLayerId] = React.useState(0);
  const toggleSwitch = () => setIsDone((previousState) => !previousState);

  useEffect(() => {
    const pin = pins.find((pin) => pin.id === pinId);
    if (pin) {
      setTaskName(pin.taskName);
      setNote(pin.note);
      setIsDone(pin.isDone);
      setSelectedLayerId(pin.layer_id);
    }
  }, [pinId, pins]);

  const selectedLayer = layers.find((layer) => layer.id === selectedLayerId);

  const save = () => {
    updatePin(pinId, taskName, note, isDone, selectedLayerId);
    setTaskName("");
    setNote("");
    setIsDone(false);
    setSelectedLayerId(0);
  };

  const handleDeletePin = () => {
    setIsConfirmationOpen(false);
    deletePin(pinId);
    setTaskName("");
    setNote("");
    setIsDone(false);
    setSelectedLayerId(0);
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
            "medium",
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          // exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          gap="$4"
        >
          <Dialog.Title>Edytuj zadanie</Dialog.Title>
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
          <Button
            style={{ backgroundColor: colors.action, color: "#fff" }}
            onPress={save}
          >
            Zapisz
          </Button>
          <CustomModal
            isOpen={isConfirmationOpen}
            onOpenChange={(isOpen) => setIsConfirmationOpen(isOpen)}
            trigger={<Button>Usuń zadanie</Button>}
            title={"Czy na pewno chcesz usunąć zadanie?"}
            body={
              <>
                <Button onPress={handleDeletePin}>Usuń zadanie</Button>
              </>
            }
            downButtons={<></>}
          />
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
