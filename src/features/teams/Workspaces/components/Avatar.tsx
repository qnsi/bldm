import { View, Text } from "react-native";
import { StyleSheet } from "react-native";
import { colors } from "src/styles/colors";

const Avatar = ({ teamName }: { teamName: string }) => {
  function getInitials() {
    var nameArray = teamName.split(" ");

    if (nameArray.length <= 1) {
      return teamName.charAt(0).toUpperCase();
    }

    return (
      nameArray[0].charAt(0).toUpperCase() +
      nameArray[1].charAt(0).toUpperCase()
    );
  }

  var cols = [colors.backgroundDark];
  // var colors = ["#FFECCC"];

  var trestcolors = [
    "#9BF6FF",
    "#CAFFBF",
    "#FDFFB6",
    "#FFD6A5",
    "#FFADAD",
    "#EFEFEF",
    "#B1E6F3",
    "#72DDF7",
    "#79B8F4",
    "#8093F1",
    "#F1F5D8",
    "#D6FFC1",
    "#B9FFAF",
    "#97FA9A",
    "#8AF0BF",
    "#F7ADC3",
    "#FCC5D9",
    "#FADDE3",
    "#F7F5ED",
    "#72DDF7",
    "#FFDBFA",
    "#FECCFF",
    "#D8BBFF",
    "#9FAFFF",
    "#A1ECFF",
    "#FFADAD",
    "#FFD6A5",
    "#FDFFB6",
    "#CAFFBF",
    "#9BF6FF",
    "#E4E4E4",
    "#D1B2A1",
    "#EEC7AC",
    "#F2E0B3",
  ];

  function getRandomColor() {
    var index = Math.floor(Math.random() * cols.length + 0);

    return cols[index];
  }

  const stls = styles({ color: getRandomColor() });
  return (
    <View style={stls.container}>
      <Text>{getInitials()}</Text>
    </View>
  );
};

export const styles = ({ color }: { color: string }) =>
  StyleSheet.create({
    container: {
      borderRadius: 5,
      justifyContent: "center",
      alignItems: "center",
      height: 40,
      width: 40,
      marginBottom: 20,
      marginTop: 20,
      marginLeft: 10,
      backgroundColor: color,
    },
  });

export default Avatar;
