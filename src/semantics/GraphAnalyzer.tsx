import { type Node, type Graph, ELineType } from "../shapes/types";
import { type Diagnostic, type DiagnosticReporter } from "./DiagnosticReporter";
import type { GraphVisitor } from "./GraphVisitor";

export class GraphAnalyzer implements DiagnosticReporter {
  private diagnostics: Diagnostic[] = [];
  private nodeMap: Map<string, Node>;

  /**
   * Initializes a new instance of the GraphAnalyzer class. Creates a map of node IDs to Node objects for quick lookup during graph traversal.
   *
   * @param graph - A Graph object to be analyzed. A Graph is an array of Node (IShape) objects.
   * @returns void
   */
  constructor(private graph: Graph) {
    this.nodeMap = new Map(graph.map((n) => [n.id, n]));
  }

  /**
   * Reports an error or warning encountered during graph traversal by saving it to the internal diagnostics list.
   *
   * @param diagnostic - A Diagnostic object representing the error or warning to be reported.
   * @returns void
   */
  report(diagnostic: Diagnostic): void {
    this.diagnostics.push(diagnostic);
  }

  /**
   * Performs a traversal of the graph using the provided GraphVisitor object.
   *
   * @param visitor - The GraphVisitor object used for the traversal.
   * @returns Map of nodes which are keys and lists of their associated diagnosed errors and warnings.
   */
  run(visitor: GraphVisitor): Map<Node, Diagnostic[]> {
    // Resets the errors before each run, and calls the enterGraph method if defined.
    this.diagnostics = [];
    visitor.enterGraph?.();

    // Visit all nodes.
    for (const node of this.graph) {
      visitor.visitNode?.(node, this);
    }

    // Visit all edges.
    for (const node of this.graph) {
      // Visit all connected nodes (hard links).
      for (const neighborId of node.connectedTo ?? []) {
        const neighbor = this.nodeMap.get(neighborId);
        if (neighbor) {
          visitor.visitEdge?.(ELineType.HARD_LINK, node, neighbor, this);
        }
      }

      // Visit all connected nodes (soft links).
      for (const neighborId of node.softConnectedTo ?? []) {
        const neighbor = this.nodeMap.get(neighborId);
        if (neighbor) {
          visitor.visitEdge?.(ELineType.SOFT_LINK, node, neighbor, this);
        }
      }

      // Visit all connected nodes (event links).
      for (const neighborId of node.eventConnectedTo ?? []) {
        const neighbor = this.nodeMap.get(neighborId);
        if (neighbor) {
          visitor.visitEdge?.(ELineType.EVENT_LINK, node, neighbor, this);
        }
      }
    }

    // Calls the exitGraph method if defined.
    visitor.exitGraph?.();

    // Groups errors by node and creates a map where the keys are nodes, and the values are lists of diagnostics objects.
    let groupedErrors: Map<Node, Diagnostic[]> = new Map();
    for (const err of this.diagnostics) {
      const node_id = err.nodeId ?? "global";
      const key = this.nodeMap.get(node_id);
      if (!key) continue;
      if (!groupedErrors.has(key)) {
        groupedErrors.set(key, []);
      }
      groupedErrors.get(key)?.push(err);
    }

    return groupedErrors;
  }
}