export enum ESeverity {
  ERROR = "error",
  WARNING = "warning",
  INFO = "info"
}

export interface Diagnostic {
  id: string;
  message: string;
  nodeId?: string;
  edgeId?: string;
  severity: ESeverity;
  details?: Record<string, any>;
}

export interface ErrorReporter {
  report(error: Diagnostic): void;
}

