import React, { useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Image } from "react-native";
import PocketBase from "pocketbase";

const pb = new PocketBase("http://127.0.0.1:8090");

type Project = {
  name: string;
  numberOfTasks: number;
  thumbnail: string;
};

export default function HomeScreen() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  useEffect(() => {
    pb.collection("projects")
      .getList()
      .then((result) => {
        setProjects(
          result.items.map((item) => {
            const url = pb.files.getUrl(item, item.thumbnail, {
              thumb: "100x250",
            });
            console.log("url: ", url);
            return {
              name: item.name,
              numberOfTasks: 0,
              thumbnail: url,
            } as Project;
          }),
        );
      });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Projekty</Text>
      <FlatList
        data={projects}
        renderItem={({ item, index }) => (
          <View style={styles.project}>
            <Image style={styles.thumbnail} source={{ uri: item.thumbnail }} />
            <Text style={styles.projectName}>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    marginLeft: 20,
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
});
