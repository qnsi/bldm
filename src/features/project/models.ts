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
  layer_id: number;
};

export type Layer = {
  id: number;
  name: string;
};

export const hardcodeLayers: Layer[] = [
  {
    id: 0,
    name: "Wszystko",
  },
  {
    id: 1,
    name: "Stan surowy",
  },
  {
    id: 2,
    name: "Dach",
  },
  {
    id: 3,
    name: "Okna, drzwi, bramy",
  },
  {
    id: 4,
    name: "Instalacje elektryczne",
  },
  {
    id: 5,
    name: "Instalacje sanitarne",
  },
  {
    id: 6,
    name: "Tynki",
  },
  {
    id: 7,
    name: "Posadzki",
  },
  {
    id: 8,
    name: "Elewacja",
  },
  {
    id: 9,
    name: "Inne",
  },
];
