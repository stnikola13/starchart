export enum EShapeType {
  STORED_PROCEDURE = "stored_procedure",
  EVENT = "event",
  EVENT_TRIGGER = "event_trigger",
  DATA_SOURCE = "data_source",
}

export interface IShape {
  id: string;
  type: EShapeType;
  x: number;
  y: number;
  isSelected: boolean;
  connectedTo?: string[];
  softConnectedTo?: string[];
  eventConnectedTo?: string[]; // Samo za EventTrigger
  name: string;
}

export interface IDataSource extends IShape {
  path?: string;
  resourceName?: string;
  dataType?: "file" | "folder";
  description?: string;
}

export interface IUniKernel extends IShape {
  image?: string;
  command?: string;
  args?: string[];
  volumes?: string[];
  targets?: string[];
  envVars?: string[];
  kernelArgs?: string;
  memory?: string;
  cpu?: string;
  prefix?: string;
  disableVirt?: boolean;
  runDetached?: boolean;
  removeOnStop?: boolean;
  networks?: string[];
  ports?: string[];
  topic?: string;
}

export interface ILine {
  id: string;
  from: string;
  to: string;
}

export type Node = IShape;
export type Graph = IShape[];