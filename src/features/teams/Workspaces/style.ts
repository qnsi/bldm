import { StyleSheet } from "react-native";
import { colors } from "src/styles/colors";

export const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundLight,
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
    marginRight: 20,
    display: "flex",
    flexDirection: "row",
    borderBottomWidth: 1,
    // justifyContent: "space-between",
    // alignItems: "center",
  },
  odd: {},
  even: {},
  workspaceName: {
    marginBottom: 20,
    marginTop: 20,
    fontWeight: "bold",
    fontSize: 20,
    marginLeft: 10,
  },
  thumbnail: {
    height: 50,
    width: 50,
    borderRadius: 10,
  },
  addNewTeamButton: {
    marginBottom: 40,
    marginRight: 20,
    backgroundColor: colors.action,
  },
});
