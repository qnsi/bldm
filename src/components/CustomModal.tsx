import { X } from "@tamagui/lucide-icons";
import { StyleSheet } from "react-native";
import { Adapt, Button, Dialog, Sheet, Unspaced, View, XStack } from "tamagui";

export const CustomModal = ({
  trigger,
  title,
  body,
  downButtons,
  onOpenChange,
  isOpen,
}: {
  trigger: JSX.Element;
  title: string;
  body: JSX.Element;
  downButtons: JSX.Element;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}) => {
  return (
    <Dialog open={isOpen} modal onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Adapt when="sm" platform="touch">
        <Sheet animation="medium" zIndex={200000} modal dismissOnSnapToBottom>
          <Sheet.Frame padding="$4" gap="$4">
            <Adapt.Contents />
          </Sheet.Frame>
          <Sheet.Overlay
            animation="lazy"
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
        </Sheet>
      </Adapt>
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
            "quicker",
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
          <Dialog.Title>{title}</Dialog.Title>
          {body}

          <XStack alignSelf="flex-end" gap="$4">
            {/* <Dialog.Close displayWhenAdapted asChild> */}
            {downButtons}
            {/* </Dialog.Close> */}
          </XStack>

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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
};
