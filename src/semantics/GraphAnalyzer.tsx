import type { Node, Graph } from "../shapes/types";
import type { Error, ErrorReporter } from "./ErrorReporter";
import type { GraphVisitor } from "./GraphVisitor";
import { SemanticVisitor } from "./SemanticVisitor";
import { SerializationVisitor } from "./SerializationVisitor";

class GraphAnalyzer implements ErrorReporter {
  private errors: Error[] = [];
  private nodeMap: Map<string, Node>;

  constructor(private graph: Graph) {
    this.nodeMap = new Map(graph.map(n => [n.id, n]));
  }

  report(error: Error): void {
    this.errors.push(error);
  }

  run(visitor: GraphVisitor): Error[] {
    this.errors = [];
    visitor.enterGraph?.(this.graph);

    for (const node of this.graph) {
      visitor.visitNode?.(node, this.graph, this);

      // for (const neighborId of node.neighbors) {
      //   const neighbor = this.nodeMap.get(neighborId);
      //   if (neighbor) {
      //      visitor.visitEdge?.(node, neighbor, this.graph, this);
      //   }
      // }
    }

    visitor.exitGraph?.(this.graph);

    return this.errors;
  }
}

export function performGraphSemanticAnalysis(graph: Graph): string[] {
    const analyzer: GraphAnalyzer = new GraphAnalyzer(graph);
    const errors: Error[] = analyzer.run(new SemanticVisitor());
    
    return errors.map(e => e.message);
}

export function performGraphSerialization(graph: Graph): boolean {
    const analyzer: GraphAnalyzer = new GraphAnalyzer(graph);
    analyzer.run(new SerializationVisitor());

    return true;
}
