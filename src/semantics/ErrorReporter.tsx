export interface Error {
  id: string;
  message: string;
  nodeId?: string;
  edgeId?: string;
  details?: Record<string, any>;
}

export interface ErrorReporter {
  report(error: Error): void;
}

