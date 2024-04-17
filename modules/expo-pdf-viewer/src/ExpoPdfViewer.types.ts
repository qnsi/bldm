export type ChangeEventPayload = {
  value: string;
};

export type ExpoPdfViewerProps = {
  name: string;
  fileSource: string;
  style: any;
  removePin: (event: any) => void;
  addPin: (event: any) => void;
};
