export type ChangeEventPayload = {
  value: string;
};

export type ExpoPdfViewerProps = {
  name: string;
  fileSource: string;
  style: any;
  onClickPin: (event: any) => void;
  onAddPin: (event: any) => void;
  pins: { x: number; y: number }[];
};
