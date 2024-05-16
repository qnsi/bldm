import { Label, Separator, Switch, XStack, YStack, styled } from "tamagui";
import { Text } from "react-native";

export const ToggleDone = ({
  showDone,
  setShowDone,
}: {
  showDone: boolean;
  setShowDone: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <XStack width={200} alignItems="center" gap="$4">
      <Label
        paddingRight="$0"
        minWidth={90}
        justifyContent="flex-end"
        size={"$4"}
        htmlFor={"toggle-done"}
      >
        Pokaż wykonane
      </Label>
      <Separator minHeight={20} vertical />
      <Switch
        id={"toggle-done"}
        size={"$3"}
        defaultChecked={showDone}
        onCheckedChange={setShowDone}
      >
        <Switch.Thumb animation="quicker" />
      </Switch>
    </XStack>
  );
};
