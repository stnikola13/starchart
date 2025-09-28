import yaml from "js-yaml";
import { v4 as uuidv4 } from "uuid";
import { type IDataSource, type IUniKernel, type Node, type Graph, EShapeType, type ILine } from "../shapes/types";

/**
 * Returns a node's ID if it exists, and in case it does not, it generates a new unique identifier.
 *
 * @param id - ID of a node (optional).
 * @returns ID of a node.
 */
function checkID(id?: string): string {
  return id && id.trim().length > 0 ? id : uuidv4();
}

/**
 * Calls the appropriate graph deserialization function on the provided serialized yaml string.
 * Calls the function that determines the coordinates of the elements that are going to be displayed on the canvas.
 *
 * @param yamlString - Yaml string which contains the serialized graph.
 * @returns Reconstructed graph object.
 */
export function performGraphDeserialization(yamlString: string): Graph {
  try {
    // Calls the function that deserializes the yaml file and reconstructs the array of shapes.
    // Calls the function that lays out all the elements by using an algorithm to determine the x and y
    // coordinates of each node.
    // Semantic analysis will be performed on the graph outside of this function.
    const graph: Graph = deserializeGraph(yamlString);
    layoutGraph(graph);
    console.log(graph);
    return graph;
  }
  catch (err) {
    // In case of any error during deserialiation, an empty graph is returned as an indicator.
    return [];
  }
}

/**
 * Reconstructs the link arrays which are used for the display of graph edges.
 *
 * @param graph - A graph object which contains all link data.
 * @returns Object with keys hardLinks, softLinks, eventLink whose values are arrays of edge objects.
 */
export function getGraphEdges(graph: Graph): any {
  // Initializes all arrays.
  let softLinks: ILine[] = [];
  let hardLinks: ILine[] = [];
  let eventLinks: ILine[] = [];

  for (const node of graph) {
    // Fetches all hard links of all nodes.
    if (node.connectedTo) {
      for (const destination of node.connectedTo) {
        hardLinks.push({
          id: uuidv4(),
          from: node.id,
          to: destination,
        });
      }
    }

    // Fetches all soft links of all nodes.
    if (node.softConnectedTo) {
      for (const destination of node.softConnectedTo) {
        softLinks.push({
          id: uuidv4(),
          from: node.id,
          to: destination,
        });
      }
    }

    // Fetches all event links of all nodes.
    if (node.eventConnectedTo) {
      for (const destination of node.eventConnectedTo) {
        eventLinks.push({
          id: uuidv4(),
          from: node.id,
          to: destination,
        });
      }
    }
  }

  // Creates an edges object.
  let edges: any = {
    lines: hardLinks,
    softLines: softLinks,
    eventLines: eventLinks
  }

  return edges;
}

/**
 * Deserializes a yaml string and reconstructs the graph object used for the display of nodes on the canvas.
 *
 * @param yamlString - Yaml string which contains the serialized graph.
 * @returns Reconstructed graph object.
 */
export function deserializeGraph(yamlString: string): Graph {
  // NameToIdMap is an inverse map of the one used during serialization. It maps the internal deterministic name
  // into a unique node ID (either the one that was saved in the yaml file, or a newly generated one).
  const nameToIdMap = new Map<string, string>();
  const parsed = yaml.load(yamlString) as any;
  const graph: Graph = [];

  // If any error occurs during the parsing of the yaml file, an exception is generated indicating an error.
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid YAML file.");
  }
  const chart = parsed.chart ?? {};

  // Firstly, all nodes are visited so that the map of IDs can be initialized. This is necessary, because edges
  // are processed during the visit of each node, in order for all nodes to be defined at that point.
  for (const [internalName, dsObj] of Object.entries(chart.dataSources ?? {})) {
    const ds = dsObj as any;
    ds.id = checkID(ds.id);
    nameToIdMap.set(internalName, ds.id);
  }
  for (const [internalName, spObj] of Object.entries(chart.storedProcedures ?? {})) {
    const sp = spObj as any;
    sp.id = checkID(sp.id);
    nameToIdMap.set(internalName, sp.id);
  }
  for (const [internalName, etObj] of Object.entries(chart.eventTriggers ?? {})) {
    const et = etObj as any;
    et.id = checkID(et.id);
    nameToIdMap.set(internalName, et.id);
  }
  for (const [internalName, evObj] of Object.entries(chart.events ?? {})) {
    const ev = evObj as any;
    ev.id = checkID(ev.id);
    nameToIdMap.set(internalName, ev.id);
  }

  // All data source objects are visited and an appropriate IDataSource object is created for each one.
  // An array of node IDs is determined for each link type using the nameToId map, because in the serialized graph
  // only internal names were used for the structure, not the IDs.
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

  // All stored procedure objects are visited and an appropriate IUniKernel object is created for each one.
  // An array of node IDs is determined for each link type using the nameToId map, because in the serialized graph
  // only internal names were used for the structure, not the IDs.
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

  // Similarly, all event trigger objects are visited and an appropriate IUniKernel object is created for each one.
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
      targets: et.features?.targets,
      envVars: et.features?.envVars,
      connectedTo: et.links?.hardLinks?.map((l: any) => nameToIdMap.get(l.destination)) ?? [],
      softConnectedTo: et.links?.softLinks?.map((l: any) => nameToIdMap.get(l.destination)) ?? [],
      eventConnectedTo: et.links?.eventLinks?.map((l: any) => nameToIdMap.get(l.destination)) ?? []
    };
    graph.push(node);
  }

  // Similarly, all event objects are visited and an appropriate IUniKernel object is created for each one.
  // The only difference is the presence of the topic field, which was absent in stored procedures and event triggers.
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
 * Determines the position of each node on the canvas so that nodes do not overlap.
 *
 * @param graph - A graph containing all the nodes that need to be laid out.
 * @returns void.
 */
export function layoutGraph(graph: Graph): void {
  // Coordinates of the upper left corner of the canvas part which will actually be used.
  const startX = 100;
  const startY = 70;
  // Horizontal and vertical gap between nodes.
  const xGap = 250;
  const yGap = 150;

  // Nodes are grouped by type, as they will be displayed in columns (one column per node type) in the defined order.
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

  // The outer loop iterates through node types and determines which column in currently used (moves horizontally).
  let x = startX;
  for (const type of typeOrder) {
    const nodes = groups.get(type);
    if (!nodes) continue;

    // The inner loop iterates through nodes of current node type, and determines the vertical position of each node
    // (moves vertically).
    let y = startY;
    for (const node of nodes) {
      node.x = x;
      node.y = y;
      y += yGap;
    }

    x += xGap;
  }
}
