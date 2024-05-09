import * as Linking from "expo-linking";
const prefix = Linking.createURL("/");

export const linking = {
  prefixes: [prefix],
  config: {
    screens: {
      AcceptInvite: "accept-invite/:token",
    },
  },
};
