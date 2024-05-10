import React from "react";
import { Workspace } from "./models";
import { useSession } from "src/utils/sessionContext";
import { supabase } from "src/utils/supabase";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { slugify } from "src/utils/slugify";

export const useGetWorkspaces = () => {
  const session = useSession();

  const getWorkspaces = async () => {
    console.log("WorkspacesScreen: useEffect fetching workspaces");
    console.log("session.user.id: ", session?.user.id);

    if (session && session.user.id !== null) {
      const { data, error } = await supabase.rpc("get_accounts");
      if (error) {
        throw new Error(error.message);
      }
      return data;
    } else {
      throw new Error("User is not logged in");
    }
  };

  const query = useQuery({ queryKey: ["workspaces"], queryFn: getWorkspaces });

  const workspaces = query.data
    ? query.data.map((workspace) => {
      return {
        name: workspace.name,
        account_id: workspace.account_id,
        personal_account: workspace.personal_account,
      } as Workspace;
    })
    : [];

  return { workspaces, getWorkspacesQuery: query };
};

export const useSaveWorkspace = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newTeamName: string) => {
      console.log("Saving new team with:");
      console.log("newTeamName: ", newTeamName);
      const { data, error } = await supabase.rpc("create_account", {
        name: newTeamName,
        slug: slugify(newTeamName),
      });
      console.log("create_account, data: ", data);
      console.log("create_account, error: ", error);
      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
};
