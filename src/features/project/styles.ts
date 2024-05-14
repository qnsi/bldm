import { StyleSheet, Dimensions } from "react-native";

export const modalStyles = StyleSheet.create({
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

export const styles = StyleSheet.create({
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
