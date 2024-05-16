import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF8EC",
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    margin: 10,
  },
  project: {
    display: "flex",
    flexDirection: "row",
    // justifyContent: "space-between",
    // alignItems: "center",
    padding: 10,
  },
  odd: {},
  even: {},
  projectName: {
    fontWeight: "bold",
    marginTop: 5,
    marginLeft: 10,
  },
  thumbnail: {
    height: 50,
    width: 50,
    borderRadius: 10,
  },
  uploadThumbnail: {
    marginRight: 50,
    height: 50,
    width: 50,
    borderRadius: 10,
  },
  projects: {
    // height: "80%",
    flexGrow: 1,
  },
  addNew: {
    height: "10%",
  },
});
