import yaml from "js-yaml";
import { v4 as uuidv4 } from "uuid";
import { type IDataSource, type IUniKernel, type Node, type Graph, EShapeType, type ILine } from "../shapes/types";

function ensureId(id?: string): string {
  return id && id.trim().length > 0 ? id : uuidv4();
}

export function performGraphDeserialization(yamlString: string): Graph {
    try {
        const graph: Graph = deserializeGraph(yamlString);
        // Podrazumeva da se semanticka analiza radi nakon rekonstrukcije (van ove funkcije)
        layoutGraph(graph);
        console.log(graph);
        return graph;
    }
    catch (err) {
        return [];
    } 
}

export function getGraphEdges(graph: Graph): any {
    let softLinks: ILine[] = [];
    let hardLinks: ILine[] = [];
    let eventLinks: ILine[] = [];

    for (const node of graph) {
    // Hard links
    if (node.connectedTo) {
      for (const target of node.connectedTo) {
        hardLinks.push({
          id: uuidv4(),
          from: node.id,
          to: target,
        });
      }
    }

    // Soft links
    if (node.softConnectedTo) {
      for (const target of node.softConnectedTo) {
        softLinks.push({
          id: uuidv4(),
          from: node.id,
          to: target,
        });
      }
    }

    // Event links
    if (node.eventConnectedTo) {
      for (const target of node.eventConnectedTo) {
        eventLinks.push({
          id: uuidv4(),
          from: node.id,
          to: target,
        });
      }
    }
  }

    let edges: any = {
        lines: hardLinks,
        softLines: softLinks,
        eventLines: eventLinks
    }

    return edges;
}

export function deserializeGraph(yamlString: string): Graph {
  const nameToIdMap = new Map<string, string>();
  const parsed = yaml.load(yamlString) as any;
  const graph: Graph = [];

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid YAML: root is not an object");
  }

  const chart = parsed.chart ?? {};

  // Prvo se mapiraju svi cvorovi iz internih imena u IDeve, da bi grane imale sve definisane cvorove!
  for (const [internalName, dsObj] of Object.entries(chart.dataSources ?? {})) {
    const ds = dsObj as any;
    ds.id = ensureId(ds.id);
    nameToIdMap.set(internalName, ds.id);
  }
  for (const [internalName, spObj] of Object.entries(chart.storedProcedures ?? {})) {
    const sp = spObj as any;
    sp.id = ensureId(sp.id);
    nameToIdMap.set(internalName, sp.id);
  }
  for (const [internalName, etObj] of Object.entries(chart.eventTriggers ?? {})) {
    const et = etObj as any;
    et.id = ensureId(et.id);
    nameToIdMap.set(internalName, et.id);
  }
  for (const [internalName, evObj] of Object.entries(chart.events ?? {})) {
    const ev = evObj as any;
    ev.id = ensureId(ev.id);
    nameToIdMap.set(internalName, ev.id);
  }

  // --- DataSources ---
  for (const [internalName, dsObj] of Object.entries(chart.dataSources ?? {})) {
    const ds = dsObj as any;
    const node: IDataSource = {
      id: ds.id,
      type: EShapeType.DATA_SOURCE,
      x: 0,
      y: 0,
      isSelected: false,
      name: ds.name ?? internalName,
      path: ds.path,
      resourceName: ds.resourceName,
      dataType: ds.type,
      description: ds.description,
      connectedTo: ds.links?.hardLinks?.map((l: any) => nameToIdMap.get(l.destination)) ?? [],
      softConnectedTo: ds.links?.softLinks?.map((l: any) => nameToIdMap.get(l.destination)) ?? [],
      eventConnectedTo: ds.links?.eventLinks?.map((l: any) => nameToIdMap.get(l.destination)) ?? []
    };
    graph.push(node);
  }

  // --- StoredProcedures ---
  for (const [internalName, spObj] of Object.entries(chart.storedProcedures ?? {})) {
    const sp = spObj as any;
    const node: IUniKernel = {
      id: sp.id,
      type: EShapeType.STORED_PROCEDURE,
      x: 0,
      y: 0,
      isSelected: false,
      name: sp.metadata?.name ?? internalName,
      image: sp.metadata?.image,
      prefix: sp.metadata?.prefix,
      disableVirt: sp.control?.disableVirtualization,
      runDetached: sp.control?.runDetached,
      removeOnStop: sp.control?.removeOnStop,
      memory: sp.control?.memory,
      kernelArgs: sp.control?.kernelArgs,
      networks: sp.features?.networks,
      ports: sp.features?.ports,
      volumes: sp.features?.volumes,
      targets: sp.features?.targets,
      envVars: sp.features?.envVars,
      connectedTo: sp.links?.hardLinks?.map((l: any) => nameToIdMap.get(l.destination)) ?? [],
      softConnectedTo: sp.links?.softLinks?.map((l: any) => nameToIdMap.get(l.destination)) ?? [],
      eventConnectedTo: sp.links?.eventLinks?.map((l: any) => nameToIdMap.get(l.destination)) ?? []
    };
    graph.push(node);
  }

  // --- EventTriggers ---
  for (const [internalName, etObj] of Object.entries(chart.eventTriggers ?? {})) {
    const et = etObj as any;
    const node: IUniKernel = {
      id: et.id,
      type: EShapeType.EVENT_TRIGGER,
      x: 0,
      y: 0,
      isSelected: false,
      name: et.metadata?.name ?? internalName,
      image: et.metadata?.image,
      prefix: et.metadata?.prefix,
      disableVirt: et.control?.disableVirtualization,
      runDetached: et.control?.runDetached,
      removeOnStop: et.control?.removeOnStop,
      memory: et.control?.memory,
      kernelArgs: et.control?.kernelArgs,
      networks: et.features?.networks,
      ports: et.features?.ports,
      volumes: et.features?.volumes,
      targets: et .features?.targets,
      envVars: et.features?.envVars,
      connectedTo: et.links?.hardLinks?.map((l: any) => nameToIdMap.get(l.destination)) ?? [],
      softConnectedTo: et.links?.softLinks?.map((l: any) => nameToIdMap.get(l.destination)) ?? [],
      eventConnectedTo: et.links?.eventLinks?.map((l: any) => nameToIdMap.get(l.destination)) ?? []
    };
    graph.push(node);
  }

  // --- Events ---
  for (const [internalName, evObj] of Object.entries(chart.events ?? {})) {
    const ev = evObj as any;
    const node: IUniKernel = {
      id: ev.id,
      type: EShapeType.EVENT,
      x: 0,
      y: 0,
      isSelected: false,
      name: ev.metadata?.name ?? internalName,
      image: ev.metadata?.image,
      prefix: ev.metadata?.prefix,
      topic: ev.metadata?.topic,
      disableVirt: ev.control?.disableVirtualization,
      runDetached: ev.control?.runDetached,
      removeOnStop: ev.control?.removeOnStop,
      memory: ev.control?.memory,
      kernelArgs: ev.control?.kernelArgs,
      networks: ev.features?.networks,
      ports: ev.features?.ports,
      volumes: ev.features?.volumes,
      targets: ev.features?.targets,
      envVars: ev.features?.envVars,
      connectedTo: ev.links?.hardLinks?.map((l: any) => nameToIdMap.get(l.destination)) ?? [],
      softConnectedTo: ev.links?.softLinks?.map((l: any) => nameToIdMap.get(l.destination)) ?? [],
      eventConnectedTo: ev.links?.eventLinks?.map((l: any) => nameToIdMap.get(l.destination)) ?? []
    };
    graph.push(node);
  }

  return graph;
}

/**
 * Assign x,y coordinates to nodes in a simple grid layout by type.
 */
export function layoutGraph(graph: Graph): void {
  const startX = 100;
  const startY = 70;
  const xGap = 250;
  const yGap = 150;

  // Group nodes by type
  const typeOrder: EShapeType[] = [EShapeType.STORED_PROCEDURE, EShapeType.DATA_SOURCE, EShapeType.EVENT_TRIGGER, EShapeType.EVENT];
  const groups: Map<EShapeType, Node[]> = new Map([ 
    [EShapeType.DATA_SOURCE, []],
    [EShapeType.STORED_PROCEDURE, []],
    [EShapeType.EVENT_TRIGGER, []],
    [EShapeType.EVENT, []]
  ]);

  for (const node of graph) {
    groups.get(node.type)?.push(node);
  }

  let x = startX;
  for (const type of typeOrder) {
    const nodes = groups.get(type);
    if (!nodes) continue;

    let y = startY;
    for (const node of nodes) {
      node.x = x;
      node.y = y;
      y += yGap;
    }

    x += xGap;
  }
}
