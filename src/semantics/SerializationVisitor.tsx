import { type Node, ELineType, EShapeType, type IDataSource, type IUniKernel, type ISettings } from "../shapes/types";
import type { DiagnosticReporter } from "./DiagnosticReporter";
import type { GraphVisitor } from "./GraphVisitor";
import yaml from "js-yaml";

export class SerializationVisitor implements GraphVisitor {
  private shapeCounters = new Map();
  private nameMap: Map<string, string> = new Map();
  private schemaData: any = {};
  private chartMetadata: any = {};

  private dataSources: any = {};
  private storedProcedures: any = {};
  private eventTriggers: any = {};
  private events: any = {};

  private output: any = {};
  private formattedYAML: string = "";

  /**
   * Initializes the global schema data and chart metadata. If no data is provided, it's substituted by default values.
   *
   * @param schemaData - An object containing the schema data and chart metadata.
   * @returns void.
   */
  constructor(schemaData: ISettings) {
    this.schemaData = {
      apiVersion: schemaData?.apiVersion ?? "v1",
      schemaVersion: schemaData?.schemaVersion ?? "v1",
      kind: schemaData?.kind ?? "StarChart",
    };
    
    let labelPairs = new Map<string, string>();
    for (const label of schemaData.labels || []) {
      const parts = label.split("=");
      if (parts.length === 2) {
        labelPairs.set(parts[0].trim(), parts[1].trim());
      }
    }

    this.chartMetadata = {
      name: schemaData?.name ?? "Untitled Chart",
      maintainer: schemaData?.maintainer ?? "Anonymous",
      description: schemaData?.description ?? "",
      visibility: schemaData?.visibility ?? "public",
      engine: schemaData?.engine ?? "unikraft",
      labels: labelPairs,
    };
  }

  /**
   * Creates a data object for the visited node and stores it inside an appropriate array based of node type.
   *
   * @param node - The Node object that is being visited.
   * @param _reporter - The DiagnosticReporter object used to report diagnostics.
   * @returns void.
   */
  visitNode(node: Node, _reporter: DiagnosticReporter): void {
    // Generate a deterministic name in the output for the node based on its type and index (current order number of that node type).
    // NameMap maps node IDs into the generated deterministic names.
    const kind = node.type;
    const idx = this.shapeCounters.get(kind) ?? 0;
    this.shapeCounters.set(kind, idx + 1);
    const name = this.getDeterministicName(kind, idx);
    this.nameMap.set(node.id, name);

    // Creates a data object for a node based of its type, and sets all field values that exist. Those that are undefined are skipped.
    // Link arrays are initialized to empty arrays, and they will be processed during edge visits.
    // Only stored procedures and event triggers have link arrays, because only those node types can be sources of links. Events cannot point to
    // anything, and data sources are forced to only be destination nodes.
    if (kind === EShapeType.DATA_SOURCE) {
      const ds = node as IDataSource;
      let data: any = {};

      data["id"] = ds.id;
      data["name"] = ds.name;
      data["type"] = ds.dataType;
      if (ds.path) data["path"] = ds.path;
      if (ds.resourceName) data["resourceName"] = ds.resourceName;
      if (ds.description) data["description"] = ds.description;
      this.dataSources[name] = data;
    } 
    else if (kind === EShapeType.STORED_PROCEDURE) {
      const sp = node as IUniKernel;
      let data: any = {};
      let metadata: any = {};
      let control: any = {};
      let features: any = {};
      let links: any = {};

      // Metadata
      metadata["id"] = sp.id;
      metadata["name"] = sp.name;
      if (sp.image) metadata["image"] = sp.image;
      if (sp.prefix) metadata["prefix"] = sp.prefix;

      // Control
      control["disableVirtualization"] = sp.disableVirt;
      control["runDetached"] = sp.runDetached;
      control["removeOnStop"] = sp.removeOnStop;
      if (sp.memory) control["memory"] = sp.memory;
      if (sp.kernelArgs) control["kernelArgs"] = sp.kernelArgs;

      // Features
      if (sp.networks && sp.networks.length > 0) features["networks"] = sp.networks;
      if (sp.ports && sp.ports.length > 0) features["ports"] = sp.ports;
      if (sp.volumes && sp.volumes.length > 0) features["volumes"] = sp.volumes;
      if (sp.targets && sp.targets.length > 0) features["targets"] = sp.targets;
      if (sp.envVars && sp.envVars.length > 0) features["envVars"] = sp.envVars;

      // Links
      links["softLinks"] = [];
      links["hardLinks"] = [];
      links["eventLinks"] = [];

      // Assemble
      if (Object.keys(metadata).length > 0) data["metadata"] = metadata;
      if (Object.keys(control).length > 0) data["control"] = control;
      if (Object.keys(features).length > 0) data["features"] = features;
      if (Object.keys(links).length > 0) data["links"] = links;

      this.storedProcedures[name] = data;
    } 
    else if (kind === EShapeType.EVENT_TRIGGER) {
      const et = node as IUniKernel;
      let data: any = {};
      let metadata: any = {};
      let control: any = {};
      let features: any = {};
      let links: any = {};

      // Metadata
      metadata["id"] = et.id;
      metadata["name"] = et.name;
      if (et.image) metadata["image"] = et.image;
      if (et.prefix) metadata["prefix"] = et.prefix;

      // Control
      control["disableVirtualization"] = et.disableVirt;
      control["runDetached"] = et.runDetached;
      control["removeOnStop"] = et.removeOnStop;
      if (et.memory) control["memory"] = et.memory;
      if (et.kernelArgs) control["kernelArgs"] = et.kernelArgs;

      // Features
      if (et.networks && et.networks.length > 0) features["networks"] = et.networks;
      if (et.ports && et.ports.length > 0) features["ports"] = et.ports;
      if (et.volumes && et.volumes.length > 0) features["volumes"] = et.volumes;
      if (et.targets && et.targets.length > 0) features["targets"] = et.targets;
      if (et.envVars && et.envVars.length > 0) features["envVars"] = et.envVars;

      // Links
      links["softLinks"] = [];
      links["hardLinks"] = [];
      links["eventLinks"] = [];

      // Assemble
      if (Object.keys(metadata).length > 0) data["metadata"] = metadata;
      if (Object.keys(control).length > 0) data["control"] = control;
      if (Object.keys(features).length > 0) data["features"] = features;
      if (Object.keys(links).length > 0) data["links"] = links;

      this.eventTriggers[name] = data;
    } 
    else if (kind === EShapeType.EVENT) {
      const ev = node as IUniKernel;
      let data: any = {};
      let metadata: any = {};
      let control: any = {};
      let features: any = {};

      // Metadata
      metadata["id"] = ev.id;
      metadata["name"] = ev.name;
      if (ev.image) metadata["image"] = ev.image;
      if (ev.prefix) metadata["prefix"] = ev.prefix;
      if (ev.topic) metadata["topic"] = ev.topic;

      // Control
      control["disableVirtualization"] = ev.disableVirt;
      control["runDetached"] = ev.runDetached;
      control["removeOnStop"] = ev.removeOnStop;
      if (ev.memory) control["memory"] = ev.memory;
      if (ev.kernelArgs) control["kernelArgs"] = ev.kernelArgs;

      // Features
      if (ev.networks && ev.networks.length > 0) features["networks"] = ev.networks;
      if (ev.ports && ev.ports.length > 0) features["ports"] = ev.ports;
      if (ev.volumes && ev.volumes.length > 0) features["volumes"] = ev.volumes;
      if (ev.targets && ev.targets.length > 0) features["targets"] = ev.targets;
      if (ev.envVars && ev.envVars.length > 0) features["envVars"] = ev.envVars;

      // Assemble
      if (Object.keys(metadata).length > 0) data["metadata"] = metadata;
      if (Object.keys(control).length > 0) data["control"] = control;
      if (Object.keys(features).length > 0) data["features"] = features;

      this.events[name] = data;
    }
  }

  /**
   * Stores a link between two nodes inside an appropriate array for the source node. All nodes will certainly be defined by the time
   * this function is called for the first time, because all nodes are visited first before the edges.
   *
   * @param edgeType - The type of the edge (hard link, soft link, event link).
   * @param from - The source Node object of the edge.
   * @param to - The destination Node object of the edge.
   * @param _reporter - The DiagnosticReporter object used to report diagnostics.
   * @returns void.
   */
  visitEdge(edgeType: ELineType, from: Node, to: Node, _reporter: DiagnosticReporter): void {
    let source: Node = from;
    let destination: Node = to;

    // Enfore Data Source to only be the destination node. If it is the source, the source and destination are swapped.
    if (
      (edgeType === ELineType.HARD_LINK || edgeType === ELineType.SOFT_LINK) &&
      from.type === EShapeType.DATA_SOURCE
    ) {
      source = to;
      destination = from;
    }

    // The appropriate node object is fetched based of the node's ID.
    const nodeName = this.nameMap.get(source.id) ?? "unknown";
    let nodeData;
    switch (source.type) {
      case EShapeType.DATA_SOURCE:
        nodeData = this.dataSources[nodeName];
        break;
      case EShapeType.STORED_PROCEDURE:
        nodeData = this.storedProcedures[nodeName];
        break;
      case EShapeType.EVENT_TRIGGER:
        nodeData = this.eventTriggers[nodeName];
        break;
      case EShapeType.EVENT:
        nodeData = this.events[nodeName];
        break;
    }

    // If the data object is not found, the function aborts.
    if (!nodeData) return;

    // Add the currently visited link based of its type into the node data object.
    switch (edgeType) {
      case ELineType.HARD_LINK:
        nodeData["links"]["hardLinks"].push({
          destination: this.nameMap.get(destination.id),
        });
        break;
      case ELineType.SOFT_LINK:
        nodeData["links"]["softLinks"].push({
          destination: this.nameMap.get(destination.id),
        });
        break;
      case ELineType.EVENT_LINK:
        nodeData["links"]["eventLinks"].push({
          destination: this.nameMap.get(destination.id),
        });
        break;
    }
  }

  /**
   * Resets the node name map, and the node type counters for determining new node names.
   *
   * @returns void.
   */
  enterGraph(): void {
    this.nameMap = new Map<string, string>();
    this.shapeCounters = new Map([
      [EShapeType.DATA_SOURCE, 0],
      [EShapeType.STORED_PROCEDURE, 0],
      [EShapeType.EVENT_TRIGGER, 0],
      [EShapeType.EVENT, 0],
    ]);
  }

  /**
   * Formats the YAML string based of saved and processed data.
   *
   * @returns void.
   */
  exitGraph(): void {
    this.assembleOutput();
    this.formattedYAML = yaml.dump(this.output, { noRefs: true });
    // If double quotes are needed everywhere in the YAML: this.formattedYAML = yaml.dump(this.output, { noRefs: true, quotingType: '"', forceQuotes: true });
  }

  /**
   * Returns the formatted YAML string.
   *
   * @returns Formatted YAML string.
   */
  getYAML(): string {
    return this.formattedYAML;
  }

  /**
   * Creates a unique deterministic name for a node which will be used in the output file.
   *
   * @param kind - The node's type.
   * @param index - The current order index of that node type.
   * @returns New node name.
   */
  private getDeterministicName(kind: EShapeType, index: number): string {
    switch (kind) {
      case EShapeType.DATA_SOURCE:
        return `datasource_${index + 1}`;
      case EShapeType.STORED_PROCEDURE:
        return `procedure_${index + 1}`;
      case EShapeType.EVENT_TRIGGER:
        return `trigger_${index + 1}`;
      case EShapeType.EVENT:
        return `event_${index + 1}`;
    }
  }

  /**
   * Assembles the data object with all necessary data which will be used for generating the YAML file.
   *
   * @returns void.
   */
  private assembleOutput(): void {
    // Create data object and initialize schema data.
    let data: any = {
      apiVersion: this.schemaData.apiVersion,
      schemaVersion: this.schemaData.schemaVersion,
      kind: this.schemaData.kind,
    };

    // Create metadata object and initialize the metadata.
    // The 'labels' object remains only if there is at least one valid label.
    let metadata: any = {};
    if (this.chartMetadata.name) metadata["name"] = this.chartMetadata.name;
    if (this.chartMetadata.maintainer)
      metadata["maintainer"] = this.chartMetadata.maintainer;
    if (this.chartMetadata.description)
      metadata["description"] = this.chartMetadata.description;
    if (this.chartMetadata.visibility)
      metadata["visibility"] = this.chartMetadata.visibility;
    if (this.chartMetadata.engine)
      metadata["engine"] = this.chartMetadata.engine;
    if (this.chartMetadata.labels && this.chartMetadata.labels.size > 0) {
      let labelObj: any = {};
      for (const [key, value] of this.chartMetadata.labels) {
        labelObj[key] = value;
      }
      metadata["labels"] = labelObj;
    }
    if (Object.keys(metadata).length > 0) data["metadata"] = metadata;

    // Clean up empty links arrays (if they are empty, they shouldn't be in the output at all).
    for (let sp of Object.values(this.storedProcedures)) {
      if ((sp as any).links) {
        if ((sp as any).links.hardLinks && (sp as any).links.hardLinks.length === 0)
          delete (sp as any).links.hardLinks;
        if ((sp as any).links.softLinks && (sp as any).links.softLinks.length === 0)
          delete (sp as any).links.softLinks;
        if ((sp as any).links.eventLinks && (sp as any).links.eventLinks.length === 0)
          delete (sp as any).links.eventLinks;
        if (Object.keys((sp as any).links).length === 0)
          delete (sp as any).links;
      }
    }
    for (let et of Object.values(this.eventTriggers)) {
      if ((et as any).links) {
        if ((et as any).links.hardLinks && (et as any).links.hardLinks.length === 0)
          delete (et as any).links.hardLinks;
        if ((et as any).links.softLinks && (et as any).links.softLinks.length === 0)
          delete (et as any).links.softLinks;
        if ((et as any).links.eventLinks && (et as any).links.eventLinks.length === 0)
          delete (et as any).links.eventLinks;
        if (Object.keys((et as any).links).length === 0)
          delete (et as any).links;
      }
    }

    // Adds node type sections if at least one node exists for that node type.
    let chart: any = {};
    if (Object.keys(this.dataSources).length > 0)
      chart["dataSources"] = this.dataSources;
    if (Object.keys(this.storedProcedures).length > 0)
      chart["storedProcedures"] = this.storedProcedures;
    if (Object.keys(this.eventTriggers).length > 0)
      chart["eventTriggers"] = this.eventTriggers;
    if (Object.keys(this.events).length > 0) 
      chart["events"] = this.events;

    // If there is at least one valid node at all, adds the chart section.
    if (Object.keys(chart).length > 0) data["chart"] = chart;

    this.output = data;
  }
}