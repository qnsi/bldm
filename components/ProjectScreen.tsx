import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Project } from "./HomeScreen";
import React, { useEffect } from "react";
import Pdf from "react-native-pdf";
import { createClient } from "@supabase/supabase-js";

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
  useEffect(() => {
    console.log("Does refreshing work?");
    console.log("project.plans: ", project.plans);
    supabase
      .from("plans")
      .select()
      .then((result) => {
        console.log("Result: ", result);
        if (result.data === null) return;
        const firstPlan = result.data[0];
        //  LOG  Result:  {"count": null, "data": [{"created_at": "2024-03-19T18:19:39.053546+00:00", "id": 1, "name": "Garwolin main", "pdf_url": "https://okqjlkjppcfdjjmumweh.supabase.co/storage/v1/object/public/plan_pdfs/garwolin-main.pdf?t=2024-03-19T18%3A18%3A19.287Z", "project_id": 1}], "error": null, "status": 200, "statusText": ""}
        setPlans([{ name: firstPlan.name, pdfUrl: firstPlan.url }]);
      });
  }, [project]);

  const PdfResource = {
    uri: plans[0] ? plans[0].pdfUrl : "",
    cache: false,
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>{project.name}</Text>
      <Pdf
        trustAllCerts={false}
        source={PdfResource}
        style={styles.pdf}
        onLoadComplete={(numberOfPages, filePath) => {
          console.log(`number of pages: ${numberOfPages}`);
        }}
      />
    </View>
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
