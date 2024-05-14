export type Plan = {
  id: number;
  name: string;
};

export type Pin = {
  id: number;
  x: number;
  y: number;
  taskName: string;
  note: string;
  isDone: boolean;
  planId: number;
};
