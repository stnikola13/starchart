import { type Node, type Graph, ELineType } from "../shapes/types";
import type { Diagnostic, ErrorReporter } from "./ErrorReporter";
import type { GraphVisitor } from "./GraphVisitor";
import { SemanticVisitor } from "./SemanticVisitor";
import { SerializationVisitor } from "./SerializationVisitor";

class GraphAnalyzer implements ErrorReporter {
  private errors: Diagnostic[] = [];
  private nodeMap: Map<string, Node>;

  constructor(private graph: Graph) {
    this.nodeMap = new Map(graph.map(n => [n.id, n]));
  }

  report(error: Diagnostic): void {
    this.errors.push(error);
  }

  run(visitor: GraphVisitor): Record<string, Diagnostic[]> {
    this.errors = [];
    visitor.enterGraph?.(this.graph);

    for (const node of this.graph) {
      visitor.visitNode?.(node, this.graph, this);

      for (const neighborId of node.connectedTo??[]) {
        const neighbor = this.nodeMap.get(neighborId);
        if (neighbor) {
           visitor.visitEdge?.(ELineType.HARD_LINK, node, neighbor, this.graph, this);
        }
      }

      for (const neighborId of node.softConnectedTo??[]) {
        const neighbor = this.nodeMap.get(neighborId);
        if (neighbor) {
           visitor.visitEdge?.(ELineType.SOFT_LINK, node, neighbor, this.graph, this);
        }
      }

      for (const neighborId of node.eventConnectedTo??[]) {
        const neighbor = this.nodeMap.get(neighborId);
        if (neighbor) {
           visitor.visitEdge?.(ELineType.EVENT_LINK, node, neighbor, this.graph, this);
        }
      }
    }

    visitor.exitGraph?.(this.graph);

    const groupedErrors = this.errors.reduce<Record<string, Diagnostic[]>>((acc, err) => {
      const key = err.nodeId ?? "global"; // fallback for graph-wide errors
      if (!acc[key]) acc[key] = [];
      acc[key].push(err);
      return acc;
    }, {});

    return groupedErrors;
  }
}

export function performGraphSemanticAnalysis(graph: Graph): Record<string, Diagnostic[]> {
    const analyzer: GraphAnalyzer = new GraphAnalyzer(graph);
    const errors: Record<string, Diagnostic[]> = analyzer.run(new SemanticVisitor());
    
    return errors;
}

export function performGraphSerialization(graph: Graph): boolean {
    const analyzer: GraphAnalyzer = new GraphAnalyzer(graph);
    analyzer.run(new SerializationVisitor());

    return true;
}
