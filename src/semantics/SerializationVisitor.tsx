import { type Node, ELineType, EShapeType, type IDataSource, type IUniKernel } from "../shapes/types";
import type { DiagnosticReporter } from "./DiagnosticReporter";
import type { GraphVisitor } from "./GraphVisitor";
import yaml from "js-yaml";

export class SerializationVisitor implements GraphVisitor {
  private shapeCounters = new Map();
  private nameMap: Map<string, string> = new Map(); // id → yaml name
  private schemaData: any = {};
  private chartMetadata: any = {};
  
  private dataSources: any = {};
  private storedProcedures: any = {};
  private eventTriggers: any = {};
  private events: any = {};

  private output: any = {};
  private formattedYAML: string = "";

  constructor(schemaData?: any, chartMetadata?: any) {
    if (schemaData) this.schemaData = schemaData;
    else {
      this.schemaData = {
        apiVersion: "v1",
        schemaVersion: "v1",
        kind: "StarChart"
      };
    }

    if (chartMetadata) this.chartMetadata = chartMetadata;
    else {
      // TEMPORARY
      this.chartMetadata = {
        name: "Test",
        maintainer: "Test",
        description: "Hello World",
        labels: {
          k1: "v1",
          k2: "v2"
        }
      };
    }
  }

  visitNode(node: Node, _reporter: DiagnosticReporter): void {
    // Generate a deterministic name for the node based on its type and index.
    const kind = node.type;
    const idx = this.shapeCounters.get(kind) ?? 0;
    this.shapeCounters.set(kind, (this.shapeCounters.get(kind) ?? 0) + 1);
    const name = this.getDeterministicName(kind, idx);
    this.nameMap.set(node.id, name);

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

  // Cuva sve grane za svaki cvor, koji ce se posle u outputu povezati sa odgovarajucim cvorom.
  // Kada se obidje neka grana, znamo da ce i from i to biti vec definisani, posto se prvo obilaze svi cvorovi, pa tek onda grane.
  visitEdge(edgeType: ELineType, from: Node, to: Node, _reporter: DiagnosticReporter): void {
    let source: Node = from;
    let destination: Node = to;

    if ((edgeType === ELineType.HARD_LINK || edgeType === ELineType.SOFT_LINK) && from.type === EShapeType.DATA_SOURCE) {
      // Enforce Stored Procedure -> Data Source direction
      source = to;
      destination = from;
    }

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

    if (!nodeData) return;

    switch (edgeType) {
      case ELineType.HARD_LINK: 
        nodeData["links"]["hardLinks"].push({destination: this.nameMap.get(destination.id)});
        break;
      case ELineType.SOFT_LINK:
        nodeData["links"]["softLinks"].push({destination: this.nameMap.get(destination.id)});
        break;
      case ELineType.EVENT_LINK:
        nodeData["links"]["eventLinks"].push({destination: this.nameMap.get(destination.id)});
        break;
    }
  }

  enterGraph(): void {
    this.nameMap = new Map<string, string>();
    this.shapeCounters = new Map([[EShapeType.DATA_SOURCE, 0], [EShapeType.STORED_PROCEDURE, 0], [EShapeType.EVENT_TRIGGER, 0], [EShapeType.EVENT, 0]]);
  }

  exitGraph(): void {
    this.assembleOutput();
    this.formattedYAML = yaml.dump(this.output, { noRefs: true });
    // If double quotes are needed:
    // this.formattedYAML = yaml.dump(this.output, { noRefs: true, quotingType: '"', forceQuotes: true });
  }

  getYAML(): string {
    return this.formattedYAML;
  }

  private getDeterministicName(kind: EShapeType, index: number): string {
    switch (kind) {
      case EShapeType.DATA_SOURCE: return `datasource_${index + 1}`;
      case EShapeType.STORED_PROCEDURE: return `procedure_${index + 1}`;
      case EShapeType.EVENT_TRIGGER: return `trigger_${index + 1}`;
      case EShapeType.EVENT:  return `event_${index + 1}`;
    }
  }

  private assembleOutput(): void {
    let data: any = {
      apiVersion: this.schemaData.apiVersion ?? "v1",
      schemaVersion: this.schemaData.schemaVersion ?? "v1",
      kind: this.schemaData.kind ?? "StarChart"
    };

    let metadata: any = {};
    if (this.chartMetadata.name) metadata["name"] = this.chartMetadata.name;
    if (this.chartMetadata.maintainer) metadata["maintainer"] = this.chartMetadata.maintainer;
    if (this.chartMetadata.description) metadata["description"] = this.chartMetadata.description;
    if (this.chartMetadata.labels && Object.keys(this.chartMetadata.labels).length > 0) metadata["labels"] = this.chartMetadata.labels;
    if (Object.keys(metadata).length > 0) data["metadata"] = metadata;

    // Cleans up empty links arrays (if they are empty, they shouldn't be in the output at all)
    for (let sp of Object.values(this.storedProcedures)) {
      if ((sp as any).links) {
        if ((sp as any).links.hardLinks && (sp as any).links.hardLinks.length === 0) delete (sp as any).links.hardLinks;
        if ((sp as any).links.softLinks && (sp as any).links.softLinks.length === 0) delete (sp as any).links.softLinks;
        if ((sp as any).links.eventLinks && (sp as any).links.eventLinks.length === 0) delete (sp as any).links.eventLinks;
        if (Object.keys((sp as any).links).length === 0) delete (sp as any).links;
      }
    }
    for (let et of Object.values(this.eventTriggers)) {
      if ((et as any).links) {
        if ((et as any).links.hardLinks && (et as any).links.hardLinks.length === 0) delete (et as any).links.hardLinks;
        if ((et as any).links.softLinks && (et as any).links.softLinks.length === 0) delete (et as any).links.softLinks;
        if ((et as any).links.eventLinks && (et as any).links.eventLinks.length === 0) delete (et as any).links.eventLinks;
        if (Object.keys((et as any).links).length === 0) delete (et as any).links;
      }
    }

    let chart: any = {};
    if (Object.keys(this.dataSources).length > 0) chart["dataSources"] = this.dataSources;
    if (Object.keys(this.storedProcedures).length > 0) chart["storedProcedures"] = this.storedProcedures;
    if (Object.keys(this.eventTriggers).length > 0) chart["eventTriggers"] = this.eventTriggers;
    if (Object.keys(this.events).length > 0) chart["events"] = this.events;
    if (Object.keys(chart).length > 0) data["chart"] = chart;

    this.output = data;
  }

}