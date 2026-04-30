export type OverlayPosition =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left"
  | "center";

export const overlayPositionLabels: Record<OverlayPosition, string> = {
  "top-right": "Arriba derecha",
  "top-left": "Arriba izquierda",
  "bottom-right": "Abajo derecha",
  "bottom-left": "Abajo izquierda",
  center: "Centro",
};

export const overlayPositionClasses: Record<OverlayPosition, string> = {
  "top-right": "top-8 right-8",
  "top-left": "top-8 left-8",
  "bottom-right": "bottom-8 right-8",
  "bottom-left": "bottom-8 left-8",
  center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
};
