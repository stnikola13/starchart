import type { Graph, Node } from "../shapes/types";
import { ESeverity, type Diagnostic } from "./DiagnosticReporter";
import { GraphAnalyzer } from "./GraphAnalyzer";
import { SemanticVisitor } from "./SemanticVisitor";
import { SerializationVisitor } from "./SerializationVisitor";

/**
 * Performs a semantic analysis run on the provided graph.
 *
 * @param graph - The Graph object to be analyzed.
 * @returns Map of nodes which are keys and lists of their associated diagnosed errors and warnings.
 */
export function performGraphSemanticAnalysis(graph: Graph): Map<Node, Diagnostic[]> {
  const analyzer: GraphAnalyzer = new GraphAnalyzer(graph);
  const errors: Map<Node, Diagnostic[]> = analyzer.run(new SemanticVisitor());
  return errors;
}

/**
 * Checks if the semantic analysis succeeded without any errors (warnings are allowed).
 *
 * @param diagnosticsMap - Map of nodes which are keys and lists of their associated diagnosed errors and warnings.
 * @returns Boolean value indicating if there were any errors found during the semantic pass.
 */
export function checkSemanticAnalysisSuccess(diagnosticsMap: Map<Node, Diagnostic[]>): boolean {
  for (const [_node, diagnostics] of diagnosticsMap) {
    if (diagnostics.some((d) => d.severity === ESeverity.ERROR)) {
      return false;
    }
  }
  return true;
}

/**
 * Performs a serialization run on the provided graph.
 *
 * @param graph - The Graph object to be analyzed.
 * @returns Boolean value indicating the success of the serialization.
 */
export function performGraphSerialization(graph: Graph): boolean {
  // Checks if the graph has any semantic errors before proceeding with serialization.
  if (!checkSemanticAnalysisSuccess(performGraphSemanticAnalysis(graph))) {
    console.log("Graph has semantic errors. Aborting serialization.");
    return false;
  }

  const analyzer: GraphAnalyzer = new GraphAnalyzer(graph);
  const serializationVisitor: SerializationVisitor = new SerializationVisitor();
  analyzer.run(serializationVisitor);

  const yaml: string = serializationVisitor.getYAML();
  downloadYaml(yaml);
  console.log(yaml);
  return true;
}

/**
 * Creates a YAML file based off a string and downloads it.
 *
 * @param yamlContent - A string containing formatted yaml data.
 * @param filename - The name of the file that will be used. Defaults to 'starchart.yaml'.
 * @returns void
 */
export function downloadYaml(yamlContent: string, filename = "startchart.yaml"): void {
  const blob = new Blob([yamlContent], { type: "text/yaml" });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}