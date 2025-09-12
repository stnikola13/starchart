import type { KonvaEventObject } from "konva/lib/Node";
import React from "react";
import { Ellipse, Group, Line, Rect, Text } from "react-konva";
import type { IShape } from "./types";

const CYLINDER_HEIGHT = 100;
const CYLINDER_WIDTH = 100;
const ELLIPSE_HEIGHT = 30;

interface IDataSourceProps {
  shape: IShape;
  selectedId: string | null;
  handleDragMove: (id: string, e: KonvaEventObject<DragEvent>) => void;
  handleShapeClick: (id: string) => void;
  handleShapeDoubleClick: (id: string, label: string) => void;
}

const DataSource = ({
  shape,
  selectedId,
  handleDragMove,
  handleShapeClick,
  handleShapeDoubleClick,
}: IDataSourceProps) => {
  return (
    <React.Fragment key={shape.id}>
      <Group
        x={shape.x}
        y={shape.y}
        draggable
        onDragMove={(e) => handleDragMove(shape.id, e)}
        onClick={() => handleShapeClick(shape.id)}
        onDblClick={() => handleShapeDoubleClick(shape.id, shape.name)}
      >
        {/* Bottom ellipse */}
        <Ellipse
          x={CYLINDER_WIDTH / 2}
          y={CYLINDER_HEIGHT - ELLIPSE_HEIGHT / 2}
          radiusX={CYLINDER_WIDTH / 2}
          radiusY={ELLIPSE_HEIGHT / 2}
          fill="#fff"
          stroke={selectedId === shape.id ? "#007bff" : "#333"}
          strokeWidth={2}
        />
        {/* Rectangle body */}
        <Rect
          x={0}
          y={ELLIPSE_HEIGHT / 2}
          width={CYLINDER_WIDTH}
          height={CYLINDER_HEIGHT - ELLIPSE_HEIGHT}
          fill="#fff"
          stroke={selectedId === shape.id ? "#007bff" : "#333"}
          strokeWidth={0}
        />
        {/* Left border */}
        <Line
          points={[
            0,
            ELLIPSE_HEIGHT / 2,
            0,
            CYLINDER_HEIGHT - ELLIPSE_HEIGHT / 2,
          ]}
          stroke={selectedId === shape.id ? "#007bff" : "#333"}
          strokeWidth={2}
        />
        {/* Right border */}
        <Line
          points={[
            CYLINDER_WIDTH,
            ELLIPSE_HEIGHT / 2,
            CYLINDER_WIDTH,
            CYLINDER_HEIGHT - ELLIPSE_HEIGHT / 2,
          ]}
          stroke={selectedId === shape.id ? "#007bff" : "#333"}
          strokeWidth={2}
        />
        {/* Top ellipse */}
        <Ellipse
          x={CYLINDER_WIDTH / 2}
          y={ELLIPSE_HEIGHT / 2}
          radiusX={CYLINDER_WIDTH / 2}
          radiusY={ELLIPSE_HEIGHT / 2}
          fill="#fff"
          stroke={selectedId === shape.id ? "#007bff" : "#333"}
          strokeWidth={2}
        />
        {/* Label */}
        <Text
          x={0}
          y={CYLINDER_HEIGHT / 2}
          width={CYLINDER_WIDTH}
          text={shape.name}
          fontSize={16}
          align="center"
          verticalAlign="middle"
          draggable={false}
        />
      </Group>
    </React.Fragment>
  );
};

export default DataSource;
