import { StyleSheet } from "react-native";
import { colors } from "src/styles/colors";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF8EC",
    flex: 1,
    paddingTop: 20,
    paddingLeft: 20,
  },
  header: {
    fontSize: 40,
    fontWeight: "bold",
    margin: 10,
  },
  project: {
    display: "flex",
    flexDirection: "row",
    // justifyContent: "space-between",
    // alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
  },
  odd: {},
  even: {},
  projectName: {
    fontWeight: "bold",
    // marginTop: 5,
    // marginLeft: 10,
    marginBottom: 20,
    marginTop: 10,
    fontSize: 20,
    marginLeft: 20,
  },
  // borderRadius: 5,
  // justifyContent: "center",
  // alignItems: "center",
  // height: 40,
  // width: 40,
  // marginBottom: 20,
  // marginTop: 20,
  // marginLeft: 10,
  // backgroundColor: color,
  thumbnail: {
    height: 50,
    width: 50,
    borderRadius: 5,
  },
  uploadThumbnail: {
    height: 75,
    width: 75,
    borderRadius: 10,
  },
  projects: {
    // height: "80%",
    flexGrow: 1,
  },
  addNew: {
    height: "10%",
  },
  addNewTeamButton: {
    marginBottom: 40,
    marginRight: 20,
    backgroundColor: colors.action,
  },
});
