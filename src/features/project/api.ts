import React, { useEffect } from "react";
import { supabase } from "src/utils/supabase";

import { useQuery } from "@tanstack/react-query";
import { Project } from "../projects/model";
import { Pin, Plan } from "./models";
import * as FileSystem from "expo-file-system";
import { Workspace } from "../teams/Workspaces/models";

export const useGetPlans = (project: Project) => {
  const getPlans = async () => {
    const { data, error } = await supabase
      .from("plans")
      .select()
      .eq("project_id", project.id);
    if (error) {
      throw new Error(error.message);
    }
    return data;
  };

  const query = useQuery({ queryKey: ["plans"], queryFn: getPlans });

  const plans = React.useMemo(() => {
    return query.data
      ? query.data.map((plan) => {
        return {
          id: plan.id,
          name: plan.name || "Nienazwany plan",
        } as Plan;
      })
      : [];
  }, [query.data]);

  return { plans, getPlansQuery: query };
};

export const useFetchPlanPdf = (
  plans: Plan[],
  selectedPlanId: number,
  setSelectedPlanId: (id: number) => void,
  workspace: Workspace,
  project: Project,
  setFileSource: React.Dispatch<React.SetStateAction<string | undefined>>,
  setPins: React.Dispatch<React.SetStateAction<Pin[]>>,
) => {
  useEffect(() => {
    if (plans.length === 0) return;
    if (selectedPlanId === 0 && plans.length > 0) {
      setSelectedPlanId(plans[0].id);
    }
    fetchPlanPdf();
  }, [selectedPlanId, plans]);

  const fetchPlanPdf = () => {
    console.log("fetchPlanPdf, selectedPlanId: ", selectedPlanId);
    console.log("fetchPlanPdf, workspace.uuid: ", workspace.uuid);
    // TODO: Don't fetch and save all the time the same pdf
    supabase.storage
      .from("plan_pdfs")
      .download(`${workspace.account_id}/${project.id}/${selectedPlanId}.pdf`)
      .then((storageResult) => {
        console.log("storageResult: ", storageResult);

        const fr = new FileReader();
        fr.onload = async () => {
          const fileUri = `${FileSystem.documentDirectory}/${selectedPlanId}.pdf`;
          await FileSystem.writeAsStringAsync(
            fileUri,
            fr.result.split(",")[1],
            { encoding: FileSystem.EncodingType.Base64 },
          );
          setFileSource(fileUri);
          setPins([]);
          fetchPins();
        };
        fr.readAsDataURL(storageResult.data);
      });
  };

  const fetchPins = () => {
    supabase
      .from("pins")
      .select()
      .eq("plan_id", selectedPlanId)
      .then((result) => {
        console.log("supabase.from(pins): ", result);
        // supabase.from(pins):  {"count": null, "data": [{"created_at": "2024-04-19T12:
        // 36:39.053764+00:00",
        // "id": 3, "is_done": false, "note": "Hello world", "plan_id": 1, "task_name": "Hello world", "x": 581.970703125, "y": 1213.865234375}], "error": null, "status": 200, "statusText": ""}
        setPins(
          result.data.map((pin) => ({
            id: pin.id,
            isDone: pin.is_done,
            note: pin.note,
            planId: pin.plan_id,
            taskName: pin.task_name,
            layer_id: pin.layer_id,
            x: pin.x,
            y: pin.y,
          })),
        );
        // setPlans([
        //   { id: firstPlan.id, name: firstPlan.name, pdfUrl: firstPlan.url },
        // ]);
      });
  };
  return { fetchPins };
};
