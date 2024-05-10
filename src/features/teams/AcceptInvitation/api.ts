import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "src/utils/supabase";

export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (token: string) => {
      console.log("Accepting invitation with token: ", token);

      const { data, error } = await supabase.rpc("accept_invitation", {
        lookup_invitation_token: token,
      });

      console.log("accept_invitation, data: ", data);
      console.log("accept_invitation, error: ", error);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
};
