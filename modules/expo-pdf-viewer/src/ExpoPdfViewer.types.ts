export type ChangeEventPayload = {
  value: string;
};

export type ExpoPdfViewerProps = {
  name: string;
  fileSource: string;
  style: any;
  clickPin: (event: any) => void;
  addPin: (event: any) => void;
  pins: { x: number; y: number }[];
};
