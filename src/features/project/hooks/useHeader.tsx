import { useEffect, useState } from "react";
import { DropdownElement, HeaderRight } from "src/components/DropdownMenu";
import { supabase } from "src/utils/supabase";
import { Project } from "../../projects/model";
import { Workspace } from "../../teams/Workspaces/models";

export const useHeader = (
  navigation,
  project: Project,
  workspace: Workspace,
) => {
  const removeProject = () => {
    supabase
      .from("projects")
      .delete()
      .eq("id", project.id)
      .then((result) => {
        console.log("delete project result: ", result);
        console.log(
          "trying to delete all project files",
          `${workspace.account_id}/${project.id}.png`,
        );
        supabase.storage
          .from("plan_thumbnails")
          .remove([`${workspace.account_id}/${project.id}.png`])
          .then((result) => {
            console.log("remove result: ", result);
          });
        console.log(
          "trying to delete all plans files",
          `${workspace.account_id}/${project.id}`,
        );
        supabase.storage
          .from("plan_pdfs")
          .list(`${workspace.account_id}/${project.id}`)
          .then(({ data, error }) => {
            console.log("get plan_pdfs data: ", data);
            console.log("get plan_pdfs error: ", error);
            const filesToRemove = data.map(
              (x) => `${workspace.account_id}/${project.id}/${x.name}`,
            );
            supabase.storage
              .from("plan_pdfs")
              .remove(filesToRemove)
              .then((result) => {
                console.log("remove plan_pdfs: result: ", result);
              });
          });
      });
  };

  const screenOptions = {
    headerRight: () => (
      <HeaderRight
        dropDownElements={
          <>
            <DropdownElement
              onPress={() => supabase.auth.signOut()}
              text={"Sign out"}
            />
            <DropdownElement onPress={removeProject} text={"Remove Project"} />
          </>
        }
      />
    ),
  };

  useEffect(() => {
    navigation.setOptions(screenOptions);
  }, [navigation]);
};
