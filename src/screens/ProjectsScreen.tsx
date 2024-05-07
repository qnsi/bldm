import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
} from "react-native";
import { createClient } from "@supabase/supabase-js";
import { Workspace } from "./WorkspacesScreen";
import { useSession } from "../../utils/sessionContext";
import { supabase } from "../../utils/supabase";
import * as ImagePicker from "expo-image-picker";
import { decode } from "base64-arraybuffer";
import { CustomModal } from "../components/CustomModal";
import { Button, Fieldset, Input, Label } from "tamagui";
import * as Clipboard from "expo-clipboard";

export type Project = {
  id: number;
  name: string;
  numberOfTasks: number;
  thumbnail: string;
  plans: string[];
};

export default function HomeScreen({ route, navigation }) {
  const workspace = route.params as Workspace;
  const session = useSession();
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [image, setImage] = React.useState<string>("");
  const [imageBase64, setImageBase64] = React.useState<string>("");
  const [newProjectName, setNewProjectName] = React.useState<string>("");
  const [invitationDeepLink, setInvitationDeepLink] =
    React.useState<string>("");

  const [dropdownVisible, setDropdownVisible] = React.useState(false);

  const screenOptions = {
    headerRight: () => (
      <>
        <Pressable
          style={
            StyleSheet.create({ pressable: { paddingRight: 20 } }).pressable
          }
          onPress={() => setDropdownVisible((prev) => !prev)}
        >
          <Text>...</Text>
        </Pressable>
        <DropdownMenu
          isVisible={dropdownVisible}
          createNewInvitation={createNewInvitation}
          invitationDeepLink={invitationDeepLink}
        />
      </>
    ),
  };

  useEffect(() => {
    navigation.setOptions(screenOptions);
  }, [navigation, dropdownVisible, invitationDeepLink]);

  useEffect(() => {
    console.log(
      "HomeScreen: useEffect fetching projects for workspace.id: ",
      workspace.account_id,
    );
    console.log("HomeScreen: session.user.id", session?.user.id);
    supabase
      .from("projects")
      .select()
      .eq("account_id", workspace.account_id)
      .then((result) => {
        console.log("HomeScreen: useEffect projects fetching result: ", result);
        // result:  {"count": null, "data": [{"created_at": "2024-03-19T18:03:44.38948+00:00", "id": 1, "name": "Garwolin", "thumbnail_url": "https://okqjlkjppcfdjjmumweh.supabase.co/storage/v1/object/sign/plan_thumbnails/Garwolin.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJwbGFuX3RodW1ibmFpbHMvR2Fyd29saW4uanBnIiwiaWF0IjoxNzEwODcxMzI5LCJleHAiOjIwMjYyMzEzMjl9.GO-14NIxlxtdcQCvOnGK9G8RuQTxIL7aD8IRKmKFHD0"}], "error": null, "status": 200, "statusText": ""}
        if (result.data === null) return;
        setProjects(
          result.data?.map((project) => {
            fetchThumbnail(project.id);
            return {
              id: project.id,
              name: project.name,
              numberOfTasks: 0,
              thumbnail: "",
              plans: [],
            } as Project;
          }),
        );
      });
  }, []);

  const fetchThumbnail = async (projectId: number) => {
    supabase.storage
      .from("plan_thumbnails")
      .download(`${workspace.account_id}/${projectId}.png`)
      .then((result) => {
        console.log("2.png", result);
        const fr = new FileReader();
        fr.readAsDataURL(result.data!);
        fr.onload = () => {
          setThumbnail(projectId, fr.result as string);
        };
      });
  };

  const setThumbnail = (projectId: number, thumbnail: string) => {
    setProjects((projects) =>
      projects.map((project) => {
        if (project.id === projectId) {
          return {
            ...project,
            thumbnail: thumbnail,
          };
        } else {
          return project;
        }
      }),
    );
  };

  const pickImage = async () => {
    console.log("pickImage");
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
      base64: true,
    });

    console.log("pickImage, result: ", result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setImageBase64(result.assets[0].base64 || "");
    }
  };

  const saveNewProject = () => {
    console.log("Saving new project with:");
    console.log("image: ", image);
    console.log("newProjectName: ", newProjectName);
    console.log("workspace: ", workspace);

    supabase
      .from("projects")
      .insert([
        {
          name: newProjectName,
          account_id: workspace.account_id,
        },
      ])
      .select()
      .then((result) => {
        console.log("insert into projects result: ", result);
        console.log(
          "trying to upload into: ",
          `${workspace.account_id}/${result.data[0].id}.png`,
        );
        supabase.storage
          .from("plan_thumbnails")
          .upload(
            `${workspace.account_id}/${result.data[0].id}.png`,
            decode(imageBase64),
            {
              contentType: "image/png",
            },
          )
          .then((result) => {
            console.log("upload result: ", result);
          });
      });
  };

  const createNewInvitation = () => {
    console.log("workspace.account_id", workspace.account_id);
    supabase
      .rpc("create_invitation", {
        account_id: workspace.account_id,
        account_role: "member",
        invitation_type: "one_time",
      })
      .then((result) => {
        console.log("create_invitation result: ", result.data.token);
        setInvitationDeepLink(`buildme://accept-invite/${result.data.token}`);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Projekty w zespole {workspace.name}</Text>
      <FlatList
        style={styles.projects}
        data={projects}
        renderItem={({ item, index }) => (
          <View>
            <Pressable
              style={styles.project}
              onPress={() =>
                navigation.navigate("Project", {
                  project: item,
                  workspace: workspace,
                })
              }
            >
              <Image
                style={styles.thumbnail}
                source={{ uri: item.thumbnail }}
              />
              <Text style={styles.projectName}>{item.name}</Text>
            </Pressable>
          </View>
        )}
      />
      <CustomModal
        trigger={
          <Button size="$5" themeInverse={true}>
            Dodaj nowy Projekt
          </Button>
        }
        title={"Dodaj nowy projekt"}
        body={
          <>
            <Fieldset gap="$4" horizontal>
              <Label width={160} justifyContent="flex-end" htmlFor="name">
                Nazwa
              </Label>
              <Input
                flex={1}
                id="name"
                defaultValue=""
                value={newProjectName}
                onChangeText={setNewProjectName}
              />
            </Fieldset>
            <Fieldset gap="$4" horizontal>
              <Label width={160} justifyContent="flex-end" htmlFor="username">
                {image && (
                  <Image
                    source={{ uri: image }}
                    style={styles.uploadThumbnail}
                  />
                )}
                <Button onPress={pickImage}>
                  Pick an image from camera roll
                </Button>
              </Label>
            </Fieldset>
          </>
        }
        downButtons={
          <Button theme="active" aria-label="Close" onPress={saveNewProject}>
            Dodaj projekt
          </Button>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
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
  uploadThumbnail: {
    marginRight: 50,
    height: 50,
    width: 50,
    borderRadius: 10,
  },
  projects: {
    // height: "80%",
    flexGrow: 1,
  },
  addNew: {
    height: "10%",
  },
});

const DropdownMenu = ({
  isVisible,
  createNewInvitation,
  invitationDeepLink,
}: {
  isVisible: boolean;
  createNewInvitation: () => void;
  invitationDeepLink: string;
}) => {
  if (!isVisible) return null;

  return (
    <View style={dropdownStyles.dropdown}>
      <Pressable
        onPress={() => supabase.auth.signOut()}
        style={dropdownStyles.dropdownItem}
      >
        <Text>Sign Out</Text>
      </Pressable>
      <CustomModal
        trigger={
          <Pressable onPress={createNewInvitation}>
            <Text>Dodaj osoby do zespołu</Text>
          </Pressable>
        }
        title={"Dodaj osoby do zespolu"}
        body={
          <>
            <Text>{invitationDeepLink}</Text>
            <Button
              onPress={() => Clipboard.setStringAsync(invitationDeepLink)}
            >
              Skopiuj link
            </Button>
          </>
        }
        downButtons={<></>}
      />
    </View>
  );
};

const dropdownStyles = StyleSheet.create({
  dropdown: {
    position: "absolute",
    right: 10,
    top: 50,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 5,
  },
  dropdownItem: {
    padding: 10,
  },
});
