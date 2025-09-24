import type { Node, Graph } from "../shapes/types";
import type { ErrorReporter } from "./ErrorReporter";

export interface GraphVisitor {
  visitNode?(node: Node, graph: Graph, reporter: ErrorReporter): void;
  visitEdge?(from: Node, to: Node, graph: Graph, reporter: ErrorReporter): void;

  // Optional lifecycle hooks
  enterGraph?(graph: Graph): void;
  exitGraph?(graph: Graph): void;
}
