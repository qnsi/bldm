import { requireNativeViewManager } from "expo-modules-core";
import * as React from "react";

import { ViewProps } from "react-native";
export type Props = ViewProps;
import { ExpoPdfViewerProps } from "./ExpoPdfViewer.types";

const NativeView: React.ComponentType<ExpoPdfViewerProps> =
  requireNativeViewManager("ExpoPdfViewer");

export default function ExpoPdfViewer(props: ExpoPdfViewerProps) {
  console.log("ExpoPdfViewer native module. Props: ", props);
  return <NativeView {...props} />;
}
