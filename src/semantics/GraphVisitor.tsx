import type { Node, ELineType } from "../shapes/types";
import type { DiagnosticReporter } from "./DiagnosticReporter";

export interface GraphVisitor {
  /**
   * The contract of the abstract method used for visiting a node.
   *
   * @param node - The Node object that is being visited.
   * @param reporter - The DiagnosticReporter object which is used to keep track of recorded diagnostics.
   * @returns void
   */
  visitNode?(node: Node, reporter: DiagnosticReporter): void;

  /**
   * The contract of the abstract method used for visiting an edge.
   *
   * @param edgeType - Type of the edge that is being visited.
   * @param from - The Node object that is the source of the edge.
   * @param to - The Node object that is the destination of the edge.
   * @param reporter - The DiagnosticReporter object which is used to keep track of recorded diagnostics.
   * @returns void
   */
  visitEdge?(edgeType: ELineType, from: Node, to: Node, reporter: DiagnosticReporter): void;

  /**
   * The contract of the abstract method used for entering a graph (initial operations before the traversal).
   *
   * @returns void
   */
  enterGraph?(): void;

  /**
   * The contract of the abstract method used for exiting a graph (final operations after the traversal).
   *
   * @returns void
   */
  exitGraph?(): void;
}
