import { requireNativeViewManager } from "expo-modules-core";
import * as React from "react";

import { ViewProps } from "react-native";
export type Props = ViewProps;
import { ExpoPdfViewerProps } from "./ExpoPdfViewer.types";

const NativeView: React.ComponentType<ExpoPdfViewerProps> =
  requireNativeViewManager("ExpoPdfViewer");

export default function ExpoPdfViewer(props: ExpoPdfViewerProps) {
  const addPin = (event) => {
    console.log("addPin, event: ", event.nativeEvent);
  };
  const removePin = (event) => {
    console.log("removePin, event: ", event.nativeEvent);
  };
  console.log("ExpoPdfViewer native module. Props: ", props);
  return <NativeView addPin={addPin} removePin={removePin} {...props} />;
}
