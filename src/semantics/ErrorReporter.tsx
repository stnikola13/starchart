export interface Diagnostic {
  id: string;
  message: string;
  nodeId?: string;
  edgeId?: string;
  details?: Record<string, any>;
}

export interface ErrorReporter {
  report(error: Diagnostic): void;
}

