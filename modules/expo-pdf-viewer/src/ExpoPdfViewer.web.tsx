import * as React from "react";

import { ExpoPdfViewerProps } from "./ExpoPdfViewer.types";

export default function ExpoPdfViewer(props: ExpoPdfViewerProps) {
  return (
    <div>
      <span>{props.name}</span>
    </div>
  );
}
