import type { KonvaEventObject } from "konva/lib/Node";
import React from "react";
import { Rect, Text } from "react-konva";
import type { IShape } from "./types";

const SHAPE_WIDTH = 120;
const SHAPE_HEIGHT = 60;

interface IEventTriggerProps {
  shape: IShape;
  selectedId: string | null;
  handleDragMove: (id: string, e: KonvaEventObject<DragEvent>) => void;
  handleShapeClick: (id: string) => void;
  handleShapeDoubleClick: (id: string, label: string) => void;
}

const EventTrigger = ({
  shape,
  selectedId,
  handleDragMove,
  handleShapeClick,
  handleShapeDoubleClick,
}: IEventTriggerProps) => {
  return (
    <React.Fragment key={shape.id}>
      <Rect
        cornerRadius={10}
        x={shape.x}
        y={shape.y}
        width={SHAPE_WIDTH}
        height={SHAPE_HEIGHT}
        fill="#fff"
        stroke={selectedId === shape.id ? "#007bff" : "#333"}
        strokeWidth={2}
        draggable
        onDragMove={(e) => handleDragMove(shape.id, e)}
        onClick={() => handleShapeClick(shape.id)}
        onDblClick={() => handleShapeDoubleClick(shape.id, shape.name)}
      />
      <Text
        x={shape.x}
        y={shape.y + SHAPE_HEIGHT / 2 - 10}
        width={SHAPE_WIDTH}
        text={shape.name}
        fontSize={16}
        align="center"
        verticalAlign="middle"
        draggable={false}
      />
    </React.Fragment>
  );
};

export default EventTrigger;
