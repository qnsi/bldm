import { requireNativeViewManager } from "expo-modules-core";
import * as React from "react";

import { ViewProps } from "react-native";
export type Props = ViewProps;

import { ExpoPdfViewerProps } from "./ExpoPdfViewer.types";

const NativeView: React.ComponentType<ViewProps> =
  requireNativeViewManager("ExpoPdfViewer");

export default function ExpoPdfViewer(props: ExpoPdfViewerProps) {
  return <NativeView style={{ flex: 1, backgroundColor: "purple" }} />;
}
