import { ELineType, EShapeType } from "../shapes/types";

export const displayTypeNames: Map<EShapeType, string> = new Map([
  [EShapeType.STORED_PROCEDURE, "stored procedure"],
  [EShapeType.DATA_SOURCE, "data source"],
  [EShapeType.EVENT_TRIGGER, "event trigger"],
  [EShapeType.EVENT, "event"]
]);

export const allowedConnections: Map<string, ELineType[]> = new Map([
    [EShapeType.STORED_PROCEDURE + "-" + EShapeType.DATA_SOURCE, [ELineType.SOFT_LINK, ELineType.HARD_LINK]],
    [EShapeType.DATA_SOURCE + "-" + EShapeType.STORED_PROCEDURE, [ELineType.SOFT_LINK, ELineType.HARD_LINK]],
    [EShapeType.DATA_SOURCE + "-" + EShapeType.EVENT_TRIGGER, [ELineType.SOFT_LINK, ELineType.HARD_LINK]],
    [EShapeType.EVENT_TRIGGER + "-" + EShapeType.DATA_SOURCE, [ELineType.SOFT_LINK, ELineType.HARD_LINK]],
    [EShapeType.EVENT_TRIGGER + "-" + EShapeType.EVENT, [ELineType.EVENT_LINK]],
]);