import { supabase } from "src/utils/supabase";
import { StyleSheet, Pressable, Text, View } from "react-native";
import React from "react";
const DropdownMenu = ({
  isVisible,
  children,
}: {
  isVisible: boolean;
  children: JSX.Element;
}) => {
  if (!isVisible) return null;

  return <View style={styles.dropdown}>{children}</View>;
};

export const DropdownElement = ({
  onPress,
  text,
}: {
  onPress: () => void;
  text: string;
}) => {
  return (
    <Pressable onPress={onPress} style={styles.dropdownItem}>
      <Text>{text}</Text>
    </Pressable>
  );
};

export const HeaderRight = ({
  dropDownElements,
  setDropdownVisible,
  dropdownVisible,
}: {
  dropDownElements: JSX.Element;
  setDropdownVisible: React.Dispatch<React.SetStateAction<boolean>>;
  dropdownVisible: boolean;
}) => {
  return (
    <>
      <Pressable
        style={StyleSheet.create({ pressable: { paddingRight: 20 } }).pressable}
        onPress={() => setDropdownVisible((prev) => !prev)}
      >
        <Text>...</Text>
      </Pressable>
      <DropdownMenu isVisible={dropdownVisible}>
        {dropDownElements}
      </DropdownMenu>
    </>
  );
};

const styles = StyleSheet.create({
  dropdown: {
    position: "absolute",
    right: 10,
    top: 50,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
    width: 150,
  },
  dropdownItem: {
    padding: 10,
  },
});

export default DropdownMenu;
