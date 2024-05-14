import React from "react";
import { supabase } from "src/utils/supabase";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { decode } from "base64-arraybuffer";
import { Project } from "./model";

export const useGetProjects = (workspaceAccountId: string) => {
  const getProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select()
      .eq("account_id", workspaceAccountId);
    if (error) {
      throw new Error(error.message);
    }
    return data;
  };

  const query = useQuery({ queryKey: ["projects"], queryFn: getProjects });

  const projects = React.useMemo(() => {
    return query.data
      ? query.data.map((project) => {
        return {
          id: project.id,
          name: project.name,
          numberOfTasks: 0,
          thumbnail: "",
          plans: [],
        } as Project;
      })
      : [];
  }, [query.data]);

  return { projects, getProjectsQuery: query };
};

export const useGetInvitationLink = (workspaceAccountId: string) => {
  const getInvitationToken = async ({ queryKey }) => {
    const [_key, { account_id }] = queryKey;
    const { data, error } = await supabase.rpc("create_invitation", {
      account_id,
      account_role: "member",
      invitation_type: "one_time",
    });
    if (error) {
      throw new Error(error.message);
    }
    return data;
  };

  const query = useQuery({
    queryKey: ["invitiationToken", { account_id: workspaceAccountId }],
    queryFn: getInvitationToken,
  });

  console.log("useGetInvitationLink, query: ", query);
  console.log("useGetInvitationLink, workspaceAccountId: ", workspaceAccountId);

  const invitationLink = `buildme://accept-invite/${query.data?.token}`;

  return { invitationLink, getInvitationLinkQuery: query };
};

export const useSaveProject = ({
  imageBase64,
  workspaceAccountId,
}: {
  imageBase64: string;
  workspaceAccountId: string;
}) => {
  const uploadProjectThumbnailMutation = useUploadProjectThumbnail();
  return useMutation({
    mutationFn: async (params: {
      newProjectName: string;
      workspaceAccountId: string;
    }) => {
      const { data, error } = await supabase
        .from("projects")
        .insert([
          {
            name: params.newProjectName,
            account_id: params.workspaceAccountId,
          },
        ])
        .select();
      console.log("useSaveProject, data: ", data);
      console.log("useSaveProject, error: ", error);
      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (data) => {
      console.log("saveProjectMutation, onSuccess, data: ", data);
      const resultProjectId = data[0].id;
      console.log("resultProjectId: ", resultProjectId);
      uploadProjectThumbnailMutation.mutate({
        resultProjectId,
        workspaceAccountId,
        imageBase64,
      });
    },
  });
};

export const useUploadProjectThumbnail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      resultProjectId: string;
      workspaceAccountId: string;
      imageBase64: string;
    }) => {
      console.log("insert into projects result: ", params.resultProjectId);
      console.log(
        "trying to upload into: ",
        `${params.workspaceAccountId}/${params.resultProjectId}.png`,
      );
      const { data, error } = await supabase.storage
        .from("plan_thumbnails")
        .upload(
          `${params.workspaceAccountId}/${params.resultProjectId}.png`,
          decode(params.imageBase64),
          {
            contentType: "image/png",
          },
        );
      if (error) {
        throw new Error(error.message);
      }
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
};
