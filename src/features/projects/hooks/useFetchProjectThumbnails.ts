import React from "react";
import { Project } from "../model";
import { supabase } from "src/utils/supabase";
import { Workspace } from "src/features/teams/Workspaces/models";

export const useFetchProjectThumbnails = (
  workspace: Workspace,
  projects: Project[],
) => {
  const [imagesToFetch, setImagesToFetch] = React.useState<
    { id: number; status: "fetched" }[]
  >([]);

  const [thumbnails, setThumbnails] = React.useState<
    { id: number; img: string }[]
  >([]);

  React.useEffect(() => {
    console.log("projects updated, projects: ", projects);
    setImagesToFetch((imagesToFetch) => {
      return projects.map((project) => {
        const match = imagesToFetch.find((image) => image.id === project.id);
        if (match) {
          return match;
        } else {
          fetchThumbnail(project.id);
          return { id: project.id, status: "fetched" };
        }
      });
    });
  }, [projects]);

  const fetchThumbnail = async (projectId: number) => {
    supabase.storage
      .from("plan_thumbnails")
      .download(`${workspace.account_id}/${projectId}.png`)
      .then((result) => {
        console.log(`${workspace.account_id}/${projectId}.png`, result);
        const fr = new FileReader();
        fr.readAsDataURL(result.data!);
        fr.onload = () => {
          setThumbnail(projectId, fr.result as string);
        };
      });
  };

  const setThumbnail = (projectId: number, img: string) => {
    setThumbnails((thumbnails) => {
      const match = thumbnails.find((thumbnail) => thumbnail.id === projectId);
      if (match) {
        return thumbnails;
      } else {
        return [...thumbnails, { id: projectId, img: img }];
      }
    });
  };

  return thumbnails;
};
