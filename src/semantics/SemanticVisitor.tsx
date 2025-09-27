import { type Node, type IDataSource, type IUniKernel, EShapeType, ELineType } from "../shapes/types";
import { checkEnvironmentVariableFormat, checkImageFormat, checkMemoryFormat, checkNetworkFormat, checkPathFormat, 
  checkPortMappingFormat, checkTargetFormat, checkVolumeFormat, isAlphanumeric } from "./AnalysisUtils";
import { ESeverity, type DiagnosticReporter } from "./DiagnosticReporter";
import type { GraphVisitor } from "./GraphVisitor";
import { v4 as uuidv4 } from "uuid";
import { displayTypeNames, allowedConnections } from "./constants";

export class SemanticVisitor implements GraphVisitor {
  private nodeNames = new Set<string>();
  private seenEdges = new Set<string>();
  private hardLinkCounts = new Map<string, number>();

  /**
   * Performs semantic analysis of a graph node. Depending on the node type, different checks are performed.
   * In case of invalid fields, diagnostics are reported using the provided DiagnosticReporter.
   *
   * @param node - The Node object that is being visited.
   * @param reporter - The DiagnosticReporter object used to report diagnostics.
   * @returns void.
   */
  visitNode(node: Node, reporter: DiagnosticReporter): void {
    // SECTION: Common checks for all nodes.

    // Checks if the node's name is valid. If not, reports an error.
    const validName: boolean = this.checkNodeName(node);
    if (!validName) {
      reporter.report({
        id: uuidv4(),
        message: node.name
          ? `Node has an invalid name: ${node.name}.`
          : `Node has an undefined name.`,
        nodeId: node.id,
        severity: ESeverity.ERROR,
        details: { name: node.name },
      });
    }

    // Check for duplicate names. If there are duplicate names, reports a warning.
    if (this.nodeNames.has(node.name)) {
      reporter.report({
        id: uuidv4(),
        message: `There already exists a node with the name '${node.name}'. Node names should be unique.`,
        nodeId: node.id,
        severity: ESeverity.WARNING,
        details: { name: node.name },
      });
    } else this.nodeNames.add(node.name);

    // SECTION: DataSource specific checks.

    // If the node is a DataSource, casts the Node to a DataSource object.
    if (node.type === EShapeType.DATA_SOURCE) {
      const data_source = node as IDataSource;

      // Checks if the data source's path is valid. If not, reports an error.
      const validPath: boolean = this.checkDataSourcePath(data_source);
      if (!validPath) {
        reporter.report({
          id: uuidv4(),
          message: data_source.path
            ? `Node has an invalid path: ${data_source.path}.`
            : `Node has an undefined path.`,
          nodeId: data_source.id,
          severity: ESeverity.ERROR,
          details: { path: data_source.path },
        });
      }

      // Checks if the data source's resource name is valid. If not, reports an error.
      const validResourceName: boolean =
        this.checkDataSourceResourceName(data_source);
      if (!validResourceName) {
        reporter.report({
          id: uuidv4(),
          message: data_source.resourceName
            ? `Node has an invalid resource name: ${data_source.resourceName}.`
            : `Node has an undefined resource name.`,
          nodeId: data_source.id,
          severity: ESeverity.ERROR,
          details: { resourceName: data_source.resourceName },
        });
      }

      // Checks if the data source's data type is valid. If not, reports an error.
      const validDataType: boolean = this.checkDataSourceDataType(data_source);
      if (!validDataType) {
        reporter.report({
          id: uuidv4(),
          message: `Node has an invalid data type: ${data_source.dataType}.`,
          nodeId: data_source.id,
          severity: ESeverity.ERROR,
          details: { dataType: data_source.dataType },
        });
      }

      // Checks if the data source's description is valid. If not, reports an error.
      const validDescription: boolean =
        this.checkDataSourceDescription(data_source);
      if (!validDescription) {
        reporter.report({
          id: uuidv4(),
          message: `Node has an invalid description: ${data_source.description}.`,
          nodeId: data_source.id,
          severity: ESeverity.ERROR,
          details: { description: data_source.description },
        });
      }
    }
    // SECTION: StoredProcedure, EventTrigger, Event specific checks.
    else {
      // If the node is not a DataSource, casts the Node to a UniKernel object.
      const unikernel = node as IUniKernel;

      // Checks if the unkernel's image is valid. If not, reports an error.
      const validImage: boolean = this.checkUniKernelImage(unikernel);
      if (!validImage) {
        reporter.report({
          id: uuidv4(),
          message: unikernel.image
            ? `Node has an invalid image: ${unikernel.image}.`
            : `Node has an undefined image.`,
          nodeId: unikernel.id,
          severity: ESeverity.ERROR,
          details: { image: unikernel.image },
        });
      }

      // Checks if the unkernel's arguments are valid. If not, reports an error.
      const validArgs: boolean = this.checkUniKernelArgs(unikernel);
      if (!validArgs) {
        reporter.report({
          id: uuidv4(),
          message: `Node has invalid kernel arguments: ${unikernel.args}.`,
          nodeId: unikernel.id,
          severity: ESeverity.ERROR,
          details: { args: unikernel.args },
        });
      }

      // Checks if the unkernel's prefix is valid. If not, reports an error.
      const validPrefix: boolean = this.checkUniKernelPrefix(unikernel);
      if (!validPrefix) {
        reporter.report({
          id: uuidv4(),
          message: `Node has an invalid prefix: ${unikernel.prefix}.`,
          nodeId: unikernel.id,
          severity: ESeverity.ERROR,
          details: { prefix: unikernel.prefix },
        });
      }

      // Checks if the unkernel's disable virtualization field is valid. If not, reports an error.
      const validDisableVirt: boolean =
        this.checkUniKernelDisableVirt(unikernel);
      if (!validDisableVirt) {
        reporter.report({
          id: uuidv4(),
          message: `Node has an invalid disableVirt value: ${unikernel.disableVirt}.`,
          nodeId: unikernel.id,
          severity: ESeverity.ERROR,
          details: { disableVirt: unikernel.disableVirt },
        });
      }

      // Checks if the unkernel's run detached field is valid. If not, reports an error.
      const validRunDetached: boolean =
        this.checkUniKernelRunDetached(unikernel);
      if (!validRunDetached) {
        reporter.report({
          id: uuidv4(),
          message: `Node has an invalid runDetached value: ${unikernel.runDetached}.`,
          nodeId: unikernel.id,
          severity: ESeverity.ERROR,
          details: { runDetached: unikernel.runDetached },
        });
      }

      // Checks if the unkernel's remove on stop field is valid. If not, reports an error.
      const validRemoveOnStop: boolean =
        this.checkUniKernelRemoveOnStop(unikernel);
      if (!validRemoveOnStop) {
        reporter.report({
          id: uuidv4(),
          message: `Node has an invalid removeOnStop value: ${unikernel.removeOnStop}.`,
          nodeId: unikernel.id,
          severity: ESeverity.ERROR,
          details: { removeOnStop: unikernel.removeOnStop },
        });
      }

      // Checks if the unkernel's networks are valid. If not, reports an error.
      const invalidNetworks: any[] = this.checkUniKernelNetworks(unikernel);
      if (invalidNetworks.length > 0) {
        reporter.report({
          id: uuidv4(),
          message: `Node has invalid networks: ${invalidNetworks.join(", ")}.`,
          nodeId: unikernel.id,
          severity: ESeverity.ERROR,
          details: { networks: invalidNetworks },
        });
      }

      // Checks if the unkernel's ports are valid. If not, reports an error.
      const invalidPorts: any[] = this.checkUniKernelPorts(unikernel);
      if (invalidPorts.length > 0) {
        reporter.report({
          id: uuidv4(),
          message: `Node has invalid port mappings: ${invalidPorts.join(
            ", "
          )}.`,
          nodeId: unikernel.id,
          severity: ESeverity.ERROR,
          details: { ports: invalidPorts },
        });
      }

      // Checks if the unkernel's volumes are valid. If not, reports an error.
      const invalidVolumes: any[] = this.checkUniKernelVolumes(unikernel);
      if (invalidVolumes.length > 0) {
        reporter.report({
          id: uuidv4(),
          message: `Node has invalid volumes: ${invalidVolumes.join(", ")}.`,
          nodeId: unikernel.id,
          severity: ESeverity.ERROR,
          details: { volumes: invalidVolumes },
        });
      }

      // Checks if the unkernel's targets are valid. If not, reports an error.
      const invalidTargets: any[] = this.checkUniKernelTargets(unikernel);
      if (invalidTargets.length > 0) {
        reporter.report({
          id: uuidv4(),
          message: `Node has invalid targets: ${invalidTargets.join(", ")}.`,
          nodeId: unikernel.id,
          severity: ESeverity.ERROR,
          details: { targets: invalidTargets },
        });
      }

      // Checks if the unkernel's environment variables are valid. If not, reports an error.
      const invalidEnvVars: any[] = this.checkUniKernelEnvVars(unikernel);
      if (invalidEnvVars.length > 0) {
        reporter.report({
          id: uuidv4(),
          message: `Node has invalid environment variables: ${invalidEnvVars.join(
            ", "
          )}.`,
          nodeId: unikernel.id,
          severity: ESeverity.ERROR,
          details: { envVars: invalidEnvVars },
        });
      }

      // Checks if the unkernel's memory field is valid. If not, reports an error.
      const validMemory: boolean = this.checkUniKernelMemory(unikernel);
      if (!validMemory) {
        reporter.report({
          id: uuidv4(),
          message: `Node has invalid memory data: ${unikernel.memory}.`,
          nodeId: unikernel.id,
          severity: ESeverity.ERROR,
          details: { memory: unikernel.memory },
        });
      }

      // SECTION: Event specific checks.
      if (node.type === EShapeType.EVENT) {
        // Checks if the event's topic is valid. If not, reports an error.
        const validTopic: boolean = this.checkEventTopic(unikernel);
        if (!validTopic) {
          reporter.report({
            id: uuidv4(),
            message: unikernel.topic
              ? `Node has an invalid topic: ${unikernel.topic}.`
              : `Node has an undefined topic.`,
            nodeId: unikernel.id,
            severity: ESeverity.ERROR,
            details: { topic: unikernel.topic },
          });
        }
      }
    }
  }

  /**
   * Performs semantic analysis of a graph edge. Checks whether the connection is allowed between the source and destination node,
   * and whether other rules are satisfied.
   *
   * @param edgeType - The type of the edge (hard link, soft link, event link).
   * @param from - The source Node object of the edge.
   * @param to - The destination Node object of the edge.
   * @param reporter - The DiagnosticReporter object used to report diagnostics.
   * @returns void.
   */
  visitEdge(edgeType: ELineType, from: Node, to: Node, reporter: DiagnosticReporter): void {
    // Checks if there are self-loops by comparing whether the source and destination node IDs are the same. If they are the same, reports an error.
    if (from.id === to.id) {
      reporter.report({
        id: uuidv4(),
        message: `Self-loop detected. Node cannot connect to itself.`,
        nodeId: from.id,
        severity: ESeverity.ERROR,
      });
    }

    // Checks if there are multiple edges between a set of two. If there are such, reports an error.
    // Uses a sorted concatenation of the two node IDs as a unique key for the edge, ensuring that the order of nodes does not matter.
    const edgeKey = [from.id, to.id].sort().join("-");
    if (this.seenEdges.has(edgeKey)) {
      reporter.report({
        id: uuidv4(),
        message: `Multiple edges detected between this node and '${to.name}' (${displayTypeNames.get(to.type)}).`,
        nodeId: from.id,
        severity: ESeverity.ERROR,
      });
    } else this.seenEdges.add(edgeKey);

    // Checks if the connection is allowed between the two node types. If not, reports an error.
    // Uses the allowedConnections map to determine whether the connection is valid.
    const linkCombination = from.type + "-" + to.type;
    const allowed = allowedConnections.get(linkCombination) ?? [];
    if (!allowed.includes(edgeType)) {
      reporter.report({
        id: uuidv4(),
        message:
          from.type === EShapeType.EVENT && to.type === EShapeType.EVENT_TRIGGER && edgeType === ELineType.EVENT_LINK
            ? `Invalid connection from this node to ${to.name} (${displayTypeNames.get(to.type)}). Event link can only be directed from an event trigger to an event.`
            : `Invalid connection from this node to ${to.name} (${displayTypeNames.get(to.type)}). No ${edgeType} links are permitted between these two node types.`,
        nodeId: from.id,
        severity: ESeverity.ERROR,
      });
    }

    // Checks if there are multiple hard links to/from a data source. If there are such, reports an error.
    // Uses the hardLinkCounts map to keep track of the number of hard links associated with each data source node.
    if (edgeType === ELineType.HARD_LINK) {
      if (to.type === EShapeType.DATA_SOURCE) {
        const count = this.hardLinkCounts.get(to.id) ?? 0;
        if (count >= 1) {
          reporter.report({
            id: uuidv4(),
            message: `This data source already has a hard link. Multiple hard links to/from a data source are not permitted.`,
            nodeId: to.id,
            severity: ESeverity.ERROR,
          });
        } else this.hardLinkCounts.set(to.id, count + 1);
      }
      if (from.type === EShapeType.DATA_SOURCE) {
        const count = this.hardLinkCounts.get(from.id) ?? 0;
        if (count >= 1) {
          reporter.report({
            id: uuidv4(),
            message: `This data source already has a hard link. Multiple hard links to/from a data source are not permitted.`,
            nodeId: from.id,
            severity: ESeverity.ERROR,
          });
        } else this.hardLinkCounts.set(from.id, count + 1);
      }
    }
  }

  /**
   * Resets state before analyzing a new graph.
   *
   * @returns void.
   */
  enterGraph(): void {
    this.nodeNames = new Set<string>();
    this.seenEdges = new Set<string>();
    this.hardLinkCounts = new Map<string, number>();
  }

  /**
   * Finalizes state after analyzing a graph.
   *
   * @returns void.
   */
  exitGraph(): void {
    // Nothing to do here for now.
  }

  // SECTION: Common fields for all nodes.

  /**
   * Checks if node's name field is valid. Node name must be non-empty and alphanumeric.
   *
   * @param node - The Node object that is being checked.
   * @returns Boolean indicating whether the node name is valid.
   */
  private checkNodeName(node: Node): boolean {
    if (!node.name || node.name.length === 0 || !isAlphanumeric(node.name))
      return false;
    return true;
  }

  // SECTION: DataSource specific fields.

  /**
   * Checks if data source's path field is valid. Path must be non-empty and must follow the appropriate format.
   *
   * @param node - The IDataSource object that is being checked.
   * @returns Boolean indicating whether the path is valid.
   */
  private checkDataSourcePath(node: IDataSource): boolean {
    if (!node.path || node.path.length === 0 || !checkPathFormat(node.path))
      return false;
    return true;
  }

  /**
   * Checks if data source's resource name field is valid. Resource name must be non-empty and alphanumeric.
   *
   * @param node - The IDataSource object that is being checked.
   * @returns Boolean indicating whether the resource name is valid.
   */
  private checkDataSourceResourceName(node: IDataSource): boolean {
    if (
      !node.resourceName ||
      node.resourceName.length === 0 ||
      !isAlphanumeric(node.resourceName)
    )
      return false;
    return true;
  }

  /**
   * Checks if data source's data type field is valid. Data type must be either 'file' or 'folder'.
   *
   * @param node - The IDataSource object that is being checked.
   * @returns Boolean indicating whether the data type is valid.
   */
  private checkDataSourceDataType(node: IDataSource): boolean {
    // Default to 'file' if not specified.
    if (!node.dataType) node.dataType = "file";
    else if (node.dataType !== "file" && node.dataType !== "folder")
      return false;
    return true;
  }

  /**
   * Checks if data source's description field is valid. There aren't any restrictions for the description. Therefore, the function always returns true.
   *
   * @param node - The IDataSource object that is being checked.
   * @returns Boolean indicating whether the description is valid.
   */
  private checkDataSourceDescription(_node: IDataSource): boolean {
    // There are no specific restrictions for description.
    return true;
  }

  // SECTION: UniKernel (StoredProcedure, EventTrigger, Event) specific fields.

  /**
   * Checks if unikernel's image field is valid. Image must be non-empty and must follow the appropriate format.
   *
   * @param node - The UniKernel object that is being checked.
   * @returns Boolean indicating whether the image is valid.
   */
  private checkUniKernelImage(node: IUniKernel): boolean {
    if (!node.image || node.image.length === 0 || !checkImageFormat(node.image))
      return false;
    return true;
  }

  /**
   * Checks if unikernel's arguments field is valid. There aren't any restrictions for the arguments. Therefore, the function always returns true.
   *
   * @param node - The UniKernel object that is being checked.
   * @returns Boolean indicating whether the arguments are valid.
   */
  private checkUniKernelArgs(_node: IUniKernel): boolean {
    // There are no specific restrictions for args.
    return true;
  }

  /**
   * Checks if unikernel's prefix field is valid. This field is optional, therefore it can be undefined or empty.
   * If it exists, it must be alphanumeric.
   *
   * @param node - The UniKernel object that is being checked.
   * @returns Boolean indicating whether the prefix is valid.
   */
  private checkUniKernelPrefix(node: IUniKernel): boolean {
    if (!node.prefix || node.prefix.length === 0) return true;
    else if (!isAlphanumeric(node.prefix)) return false;
    return true;
  }

  /**
   * Checks if unikernel's disable virtualization field is valid. There aren't any restrictions, therefore the function always returns true.
   * If the field is undefined, it defaults to false.
   *
   * @param node - The UniKernel object that is being checked.
   * @returns Boolean indicating whether the disable virtualization field is valid.
   */
  private checkUniKernelDisableVirt(node: IUniKernel): boolean {
    if (!node.disableVirt) node.disableVirt = false;
    return true;
  }

  /**
   * Checks if unikernel's run detached field is valid. There aren't any restrictions, therefore the function always returns true.
   * If the field is undefined, it defaults to false.
   *
   * @param node - The UniKernel object that is being checked.
   * @returns Boolean indicating whether the run detached field is valid.
   */
  private checkUniKernelRunDetached(node: IUniKernel): boolean {
    if (!node.runDetached) node.runDetached = false;
    return true;
  }

  /**
   * Checks if unikernel's remove on stop field is valid. There aren't any restrictions, therefore the function always returns true.
   * If the field is undefined, it defaults to false.
   *
   * @param node - The UniKernel object that is being checked.
   * @returns Boolean indicating whether the remove on stop field is valid.
   */
  private checkUniKernelRemoveOnStop(node: IUniKernel): boolean {
    if (!node.removeOnStop) node.removeOnStop = false;
    return true;
  }

  /**
   * Checks if unikernel's networks array is valid. This field is optional, therefore it can be undefined or an empty array.
   * If it exists, each network has to follow the appropriate format.
   *
   * @param node - The UniKernel object that is being checked.
   * @returns Array of invalid network entries. If the array is empty, all networks are valid.
   */
  private checkUniKernelNetworks(node: IUniKernel): any[] {
    if (!node.networks || node.networks.length === 0) return [];

    let invalidEntries = [];
    for (const [_index, network] of node.networks.entries()) {
      if (!checkNetworkFormat(network)) invalidEntries.push(network);
    }
    return invalidEntries;
  }

  /**
   * Checks if unikernel's ports array is valid. This field is optional, therefore it can be undefined or an empty array.
   * If it exists, each port has to follow the appropriate format.
   *
   * @param node - The UniKernel object that is being checked.
   * @returns Array of invalid port entries. If the array is empty, all ports are valid.
   */
  private checkUniKernelPorts(node: IUniKernel): any[] {
    if (!node.ports || node.ports.length === 0) return [];

    let invalidEntries = [];
    for (const [_index, portMapping] of node.ports.entries()) {
      if (!checkPortMappingFormat(portMapping))
        invalidEntries.push(portMapping);
    }
    return invalidEntries;
  }

  /**
   * Checks if unikernel's volumes array is valid. This field is optional, therefore it can be undefined or an empty array.
   * If it exists, each volume has to follow the appropriate format.
   *
   * @param node - The UniKernel object that is being checked.
   * @returns Array of invalid volume entries. If the array is empty, all volumes are valid.
   */
  private checkUniKernelVolumes(node: IUniKernel): any[] {
    if (!node.volumes || node.volumes.length === 0) return [];

    let invalidEntries = [];
    for (const [_index, volume] of node.volumes.entries()) {
      if (!checkVolumeFormat(volume)) invalidEntries.push(volume);
    }
    return invalidEntries;
  }

  /**
   * Checks if unikernel's targets array is valid. This field is optional, therefore it can be undefined or an empty array.
   * If it exists, each target has to follow the appropriate format.
   *
   * @param node - The UniKernel object that is being checked.
   * @returns Array of invalid target entries. If the array is empty, all targets are valid.
   */
  private checkUniKernelTargets(node: IUniKernel): any[] {
    if (!node.targets || node.targets.length === 0) return [];

    let invalidEntries = [];
    for (const [_index, target] of node.targets.entries()) {
      if (!checkTargetFormat(target)) invalidEntries.push(target);
    }
    return invalidEntries;
  }

  /**
   * Checks if unikernel's environment variables array is valid. This field is optional, therefore it can be undefined or an empty array.
   * If it exists, each variable has to follow the appropriate format.
   *
   * @param node - The UniKernel object that is being checked.
   * @returns Array of invalid environtment variables entries. If the array is empty, all variables are valid.
   */
  private checkUniKernelEnvVars(node: IUniKernel): any[] {
    if (!node.envVars || node.envVars.length === 0) return [];

    let invalidEntries = [];
    for (const [_index, envVar] of node.envVars.entries()) {
      if (!checkEnvironmentVariableFormat(envVar)) invalidEntries.push(envVar);
    }
    return invalidEntries;
  }

  /**
   * Checks if unikernel's memory field is valid. This field is optional, therefore it can be undefined or empty.
   * If it exists, it must follow the appropriate format.
   *
   * @param node - The UniKernel object that is being checked.
   * @returns Boolean indicating whether the memory string is valid.
   */
  private checkUniKernelMemory(node: IUniKernel): boolean {
    if (!node.memory || node.memory.length === 0) return true;
    else if (!checkMemoryFormat(node.memory)) return false;
    return true;
  }

  // SECTION: Event specific fields.

  /**
   * Checks if unikernel's topic field is valid. The field must be non-emopty and alphanumeric.
   *
   * @param node - The UniKernel object that is being checked.
   * @returns Boolean indicating whether the topic is valid.
   */
  private checkEventTopic(node: IUniKernel): boolean {
    if (!node.topic || node.topic.length === 0 || !isAlphanumeric(node.topic))
      return false;
    return true;
  }
}
