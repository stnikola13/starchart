import type { Node, Graph, ELineType } from "../shapes/types";
import type { DiagnosticReporter } from "./DiagnosticReporter";
import type { GraphVisitor } from "./GraphVisitor";

export class SerializationVisitor implements GraphVisitor {
      visitNode(node: Node, _graph: Graph, reporter: DiagnosticReporter): void {
        // TBA
      }

      visitEdge(edgeType: ELineType, from: Node, to: Node, _graph: Graph, reporter: DiagnosticReporter): void {
        // TBA
      }
    
      enterGraph(_graph: Graph): void {
        // TBA
      }
    
      exitGraph(_graph: Graph): void {
        // TBA
      }
}