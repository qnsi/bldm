import {
  NativeModulesProxy,
  EventEmitter,
  Subscription,
} from "expo-modules-core";

// Import the native module. On web, it will be resolved to ExpoPdfViewer.web.ts
// and on native platforms to ExpoPdfViewer.ts
import ExpoPdfViewerModule from "./src/ExpoPdfViewerModule";
import ExpoPdfViewer from "./src/ExpoPdfViewer";
import {
  ChangeEventPayload,
  ExpoPdfViewerProps,
} from "./src/ExpoPdfViewer.types";

// Get the native constant value.
export const PI = ExpoPdfViewerModule.PI;

export function hello(): string {
  return ExpoPdfViewerModule.hello();
}

export async function setValueAsync(value: string) {
  return await ExpoPdfViewerModule.setValueAsync(value);
}

const emitter = new EventEmitter(
  ExpoPdfViewerModule ?? NativeModulesProxy.ExpoPdfViewer,
);

export function addChangeListener(
  listener: (event: ChangeEventPayload) => void,
): Subscription {
  return emitter.addListener<ChangeEventPayload>("onChange", listener);
}

export { ExpoPdfViewer, ExpoPdfViewerProps, ChangeEventPayload };
