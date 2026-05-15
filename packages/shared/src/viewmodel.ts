export type LengthUnit = "mm" | "m";

export interface Point2D {
  x: number;
  y: number;
}

export interface Bounds2D {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface RectangleShape {
  kind: "rectangle";
  x: number;
  y: number;
  width: number;
  height: number;
  stroke?: string;
  fill?: string;
}

export interface LineShape {
  kind: "line";
  from: Point2D;
  to: Point2D;
  stroke?: string;
  strokeDasharray?: string;
}

export interface PolygonShape {
  kind: "polygon";
  points: Point2D[];
  stroke?: string;
  fill?: string;
}

export interface ArrowShape {
  kind: "arrow";
  from: Point2D;
  to: Point2D;
  stroke?: string;
}

export interface DimensionShape {
  kind: "dimension";
  from: Point2D;
  to: Point2D;
  offset: number;
  label: string;
}

export type Shape2D =
  | RectangleShape
  | LineShape
  | PolygonShape
  | ArrowShape
  | DimensionShape;

export interface Annotation2D {
  text: string;
  anchor: Point2D;
  align?: "left" | "center" | "right";
}

export interface ViewModel2D {
  shapes: Shape2D[];
  bounds: Bounds2D;
  units: LengthUnit;
  annotations: Annotation2D[];
}
