import React from "react";
import { useEffect } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { View, Text, Pressable, Modal, TextInput, Switch } from "react-native";
import { modalStyles } from "../styles";
import { Layer, Pin } from "../models";
import { Dialog, Button, Unspaced, YGroup } from "tamagui";
import { X } from "@tamagui/lucide-icons";
import { SelectLayer } from "./SelectLayer";
import { colors } from "src/styles/colors";
import { CustomModal } from "src/components/CustomModal";

export const MultiplePinsModal = ({
  isVisible,
  onClose,
  pinIds,
  pins,
  layers,
  clickSinglePin,
}: {
  isVisible: boolean;
  onClose: () => void;
  pinIds: number[];
  pins: Pin[];
  clickSinglePin: (pinId: number) => void;
  layers: Layer[];
}) => {
  const availablePins = pins.filter((pin) => pinIds.includes(pin.id));
  console.log("availablePins: ", availablePins);

  return (
    <Dialog modal open={isVisible} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          // animation="medium"
          opacity={0.5}
          // enterStyle={{ opacity: 0 }}
          // exitStyle={{ opacity: 0 }}
        />

        <Dialog.Content
          bordered
          elevate
          key="content"
          // animateOnly={["transform", "opacity"]}
          // animation={[
          //   "medium",
          //   {
          //     opacity: {
          //       overshootClamping: true,
          //     },
          //   },
          // ]}
          // enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          // exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          gap="$4"
        >
          <Dialog.Title>Wybierz zadanie</Dialog.Title>
          {availablePins.map((pin) => {
            return (
              <Button onPress={() => clickSinglePin(pin.id)}>
                {pin.taskName}
              </Button>
            );
          })}
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
