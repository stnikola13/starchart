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

export interface DiagnosticReporter {
  /**
  * The contract of the abstract method used for reporting a diagnostic.
  *
  * @param diagnostic - The Diagnostic object which is being reported.
  * @returns void
  */
  report(diagnostic: Diagnostic): void;
}