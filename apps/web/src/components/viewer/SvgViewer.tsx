import type { ViewModel2D, Shape2D, Annotation2D, Point2D } from "@struct-flow/shared";

export interface SvgViewerProps {
  viewModel: ViewModel2D;
  className?: string;
  padding?: number;
}

export function SvgViewer({ viewModel, className, padding = 40 }: SvgViewerProps) {
  const { minX, minY, maxX, maxY } = viewModel.bounds;
  const width = maxX - minX + padding * 2;
  const height = maxY - minY + padding * 2;
  const viewBox = `${minX - padding} ${minY - padding} ${width} ${height}`;

  return (
    <svg
      data-testid="svg-viewer"
      className={className ?? "w-full h-full"}
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        {viewModel.shapes.map((s, i) => (
          <ShapeNode key={i} shape={s} />
        ))}
        {viewModel.annotations.map((a, i) => (
          <AnnotationNode key={`a${i}`} annotation={a} />
        ))}
      </g>
    </svg>
  );
}

function ShapeNode({ shape }: { shape: Shape2D }) {
  switch (shape.kind) {
    case "rectangle":
      return (
        <rect
          x={shape.x}
          y={shape.y}
          width={shape.width}
          height={shape.height}
          stroke={shape.stroke ?? "#1f2937"}
          fill={shape.fill ?? "transparent"}
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
        />
      );
    case "line":
      return (
        <line
          x1={shape.from.x}
          y1={shape.from.y}
          x2={shape.to.x}
          y2={shape.to.y}
          stroke={shape.stroke ?? "#1f2937"}
          strokeWidth={2}
          strokeDasharray={shape.strokeDasharray}
          vectorEffect="non-scaling-stroke"
        />
      );
    case "polygon":
      return (
        <polygon
          points={shape.points.map((p) => `${p.x},${p.y}`).join(" ")}
          stroke={shape.stroke ?? "#1f2937"}
          fill={shape.fill ?? "transparent"}
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
        />
      );
    case "arrow":
      return <ArrowShape from={shape.from} to={shape.to} stroke={shape.stroke ?? "#dc2626"} />;
    case "dimension":
      return <DimensionShape from={shape.from} to={shape.to} offset={shape.offset} label={shape.label} />;
    default: {
      const _exhaustive: never = shape;
      return _exhaustive;
    }
  }
}

function ArrowShape({ from, to, stroke }: { from: Point2D; to: Point2D; stroke: string }) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const head = 30;
  // perpendicular
  const px = -uy;
  const py = ux;
  const tipBase = { x: to.x - ux * head, y: to.y - uy * head };
  const wing1 = { x: tipBase.x + px * (head / 2), y: tipBase.y + py * (head / 2) };
  const wing2 = { x: tipBase.x - px * (head / 2), y: tipBase.y - py * (head / 2) };
  return (
    <g stroke={stroke} fill={stroke} strokeWidth={2} vectorEffect="non-scaling-stroke">
      <line x1={from.x} y1={from.y} x2={tipBase.x} y2={tipBase.y} />
      <polygon points={`${to.x},${to.y} ${wing1.x},${wing1.y} ${wing2.x},${wing2.y}`} />
    </g>
  );
}

function DimensionShape({
  from,
  to,
  offset,
  label,
}: {
  from: Point2D;
  to: Point2D;
  offset: number;
  label: string;
}) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  // perpendicular offset direction
  const px = -dy / len;
  const py = dx / len;
  const a = { x: from.x + px * offset, y: from.y + py * offset };
  const b = { x: to.x + px * offset, y: to.y + py * offset };
  const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  return (
    <g stroke="#6b7280" fill="#374151" strokeWidth={1} vectorEffect="non-scaling-stroke">
      <line x1={from.x} y1={from.y} x2={a.x} y2={a.y} />
      <line x1={to.x} y1={to.y} x2={b.x} y2={b.y} />
      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
      <text
        x={mid.x}
        y={mid.y - 6}
        fontSize={36}
        textAnchor="middle"
        stroke="none"
        style={{ paintOrder: "stroke" }}
      >
        {label}
      </text>
    </g>
  );
}

function AnnotationNode({ annotation }: { annotation: Annotation2D }) {
  const anchor =
    annotation.align === "left" ? "start" : annotation.align === "right" ? "end" : "middle";
  return (
    <text
      x={annotation.anchor.x}
      y={annotation.anchor.y}
      fontSize={36}
      textAnchor={anchor}
      fill="#111827"
    >
      {annotation.text}
    </text>
  );
}
