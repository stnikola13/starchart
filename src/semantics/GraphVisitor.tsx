import type { Node, Graph, ELineType } from "../shapes/types";
import type { DiagnosticReporter } from "./DiagnosticReporter";

export interface GraphVisitor {
  /**
   * The contract of the abstract method used for visiting a node.
   *
   * @param node - The Node object that is being visited.
   * @param graph - The Graph object to which the node belongs to.
   * @param reporter - The DiagnosticReporter object which is used to keep track of recorded diagnostics.
   * @returns void
   */
  visitNode?(node: Node, graph: Graph, reporter: DiagnosticReporter): void;

  /**
   * The contract of the abstract method used for visiting an edge.
   *
   * @param edgeType - Type of the edge that is being visited.
   * @param from - The Node object that is the source of the edge.
   * @param to - The Node object that is the destination of the edge.
   * @param graph - The Graph object to which the edge belongs to.
   * @param reporter - The DiagnosticReporter object which is used to keep track of recorded diagnostics.
   * @returns void
   */
  visitEdge?(edgeType: ELineType, from: Node, to: Node, graph: Graph, reporter: DiagnosticReporter): void;

  /**
   * The contract of the abstract method used for entering a graph (initial operations before the traversal).
   *
   * @param graph - The Graph object which is being visited.
   * @returns void
   */
  enterGraph?(graph: Graph): void;

  /**
   * The contract of the abstract method used for exiting a graph (final operations after the traversal).
   *
   * @param graph - The Graph object which is being visited.
   * @returns void
   */
  exitGraph?(graph: Graph): void;
}
