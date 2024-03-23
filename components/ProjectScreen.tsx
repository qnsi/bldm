import { View, Text, StyleSheet, Dimensions, SafeAreaView } from "react-native";
import { Project } from "./HomeScreen";
import React, { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

import PdfRendererView from "react-native-pdf-renderer";
import * as FileSystem from "expo-file-system";

type Plan = {
  name: string;
  pdfUrl: string;
};

const supabase = createClient(
  "https://okqjlkjppcfdjjmumweh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rcWpsa2pwcGNmZGpqbXVtd2VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA4NzAxNDUsImV4cCI6MjAyNjQ0NjE0NX0.QjEDBglODFUU0U7Qg1D1dedr3tgUyPwigihvb7Bp-2Y",
);

export default function ProjectScreen({ route, navigation }) {
  const project = route.params as Project;
  const [plans, setPlans] = React.useState<Plan[]>([]);
  const [fileSource, setFileSource] = React.useState<string>();

  useEffect(() => {
    console.log("ProjectScreen: useEffect, fetching plans");
    supabase
      .from("plans")
      .select()
      .then((result) => {
        console.log("supabase.from(plans): ", result);
        if (result.data === null) return;
        const firstPlan = result.data[0];
        //  LOG  Result:  {"count": null, "data": [{"created_at": "2024-03-19T18:19:39.053546+00:00", "id": 1, "name": "Garwolin main", "pdf_url": "https://okqjlkjppcfdjjmumweh.supabase.co/storage/v1/object/public/plan_pdfs/garwolin-main.pdf?t=2024-03-19T18%3A18%3A19.287Z", "project_id": 1}], "error": null, "status": 200, "statusText": ""}
        setPlans([{ name: firstPlan.name, pdfUrl: firstPlan.url }]);
        FileSystem.downloadAsync(
          firstPlan.url,
          FileSystem.documentDirectory + "file.pdf",
        ).then(({ uri }) => {
          console.log("FileSystem.downloadAsync uri: ", uri);
          setFileSource(uri);
        });
      });
  }, [project]);

  const PdfResource = {
    uri: fileSource,
    cache: false,
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Text>{project.name}</Text>
      <PdfRendererView
        style={{ backgroundColor: "white" }}
        source={fileSource}
        distanceBetweenPages={16}
        maxZoom={2}
        singlePage={true}
        onPageChange={(current, total) => {
          console.log("onPageChange", { current, total });
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
