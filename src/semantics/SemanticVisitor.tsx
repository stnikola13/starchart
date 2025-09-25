import { type Node, type Graph, type IDataSource, type IUniKernel, EShapeType, ELineType } from "../shapes/types";
import { checkEnvironmentVariableFormat, checkImageFormat, checkMemoryFormat, checkNetworkFormat, checkPathFormat, checkPortMappingFormat, checkTargetFormat, checkVolumeFormat, isAlphanumeric } from "./AnalysisUtils";
import type { ErrorReporter } from "./ErrorReporter";
import type { GraphVisitor } from "./GraphVisitor";
import { v4 as uuidv4 } from "uuid";

const allowedConnections: Record<string, Record<string, ELineType[]>> = {
  "stored_procedure": { "data_source": [ELineType.SOFT_LINK, ELineType.HARD_LINK] },
  "data_source": { "stored_procedure": [ELineType.SOFT_LINK, ELineType.HARD_LINK], "event_trigger": [ELineType.SOFT_LINK, ELineType.HARD_LINK] },
  "event_trigger": { "data_source": [ELineType.SOFT_LINK, ELineType.HARD_LINK], "event": [ELineType.EVENT_LINK] },
  "event": {}
};

const displayTypeNames: Map<string, string> = new Map([
  ["stored_procedure", "stored procedure"],
  ["data_source", "data source"],
  ["event_trigger", "event trigger"],
  ["event", "event"]
]);

export class SemanticVisitor implements GraphVisitor {
    private seenEdges = new Set<string>();
    private hardLinkCounts = new Map<string, number>();

    visitNode(node: Node, _graph: Graph, reporter: ErrorReporter): void {
        // Common checks for all nodes.
        const validName: boolean = this.checkNodeName(node);
        if (!validName) {
            reporter.report({
                id: uuidv4(),
                message: `Node has an invalid name: ${node.name}.`,
                nodeId: node.id,
                details: { name: node.name }
            });
        }

        // DataSource specific checks.
        if (node.type === EShapeType.DATA_SOURCE) {
            const data_source = node as IDataSource;

            const validPath: boolean = this.checkDataSourcePath(data_source);
            if (!validPath) {
                reporter.report({
                    id: uuidv4(),
                    message: `Node has an invalid path: ${data_source.path}.`,
                    nodeId: data_source.id,
                    details: { path: data_source.path }
                });
            }

            const validResourceName: boolean = this.checkDataSourceResourceName(data_source);
            if (!validResourceName) {
                reporter.report({
                    id: uuidv4(),
                    message: `Node has an invalid resource name: ${data_source.resourceName}.`,
                    nodeId: data_source.id,
                    details: { resourceName: data_source.resourceName }
                });
            }

            const validDataType: boolean = this.checkDataSourceDataType(data_source);
            if (!validDataType) {
                reporter.report({
                    id: uuidv4(),
                    message: `Node has an invalid data type: ${data_source.dataType}.`,
                    nodeId: data_source.id,
                    details: { dataType: data_source.dataType }
                });
            }

            const validDescription: boolean = this.checkDataSourceDescription(data_source);
            if (!validDescription) {
                reporter.report({
                    id: uuidv4(),
                    message: `Node has an invalid description: ${data_source.description}.`,
                    nodeId: data_source.id,
                    details: { description: data_source.description }
                });
            }
        }
        // StoredProcedure, EventTrigger, Event specific checks.
        else {
            const unikernel = node as IUniKernel;

            const validImage: boolean = this.checkUniKernelImage(unikernel);
            if (!validImage) {
                reporter.report({
                    id: uuidv4(),
                    message: `Node has an invalid image: ${unikernel.image}.`,
                    nodeId: unikernel.id,
                    details: { image: unikernel.image }
                });
            }

            const validArgs: boolean = this.checkUniKernelArgs(unikernel);
            if (!validArgs) {
                reporter.report({
                    id: uuidv4(),
                    message: `Node has invalid kernel arguments: ${unikernel.args}.`,
                    nodeId: unikernel.id,
                    details: { args: unikernel.args }
                });
            }

            const validPrefix: boolean = this.checkUniKernelPrefix(unikernel);
            if (!validPrefix) {
                reporter.report({
                    id: uuidv4(),
                    message: `Node has an invalid prefix: ${unikernel.prefix}.`,
                    nodeId: unikernel.id,
                    details: { prefix: unikernel.prefix }
                });
            }

            const validDisableVirt: boolean = this.checkUniKernelDisableVirt(unikernel);
            if (!validDisableVirt) {
                reporter.report({
                    id: uuidv4(),
                    message: `Node has an invalid disableVirt value: ${unikernel.disableVirt}.`,
                    nodeId: unikernel.id,
                    details: { disableVirt: unikernel.disableVirt }
                });
            }

            const validRunDetached: boolean = this.checkUniKernelRunDetached(unikernel);
            if (!validRunDetached) {
                reporter.report({
                    id: uuidv4(),
                    message: `Node has an invalid runDetached value: ${unikernel.runDetached}.`,
                    nodeId: unikernel.id,
                    details: { runDetached: unikernel.runDetached }
                });
            }

            const validRemoveOnStop: boolean = this.checkUniKernelRemoveOnStop(unikernel);
            if (!validRemoveOnStop) {
                reporter.report({
                    id: uuidv4(),
                    message: `Node has an invalid removeOnStop value: ${unikernel.removeOnStop}.`,
                    nodeId: unikernel.id,
                    details: { removeOnStop: unikernel.removeOnStop }
                });
            }

            const invalidNetworks: any[] = this.checkUniKernelNetworks(unikernel);
            if (invalidNetworks.length > 0) {
                reporter.report({
                    id: uuidv4(),
                    message: `Node has invalid networks: ${invalidNetworks.join(", ")}.`,
                    nodeId: unikernel.id,
                    details: { networks: invalidNetworks }
                });
            }

            const invalidPorts: any[] = this.checkUniKernelPorts(unikernel);
            if (invalidPorts.length > 0) {
                reporter.report({
                    id: uuidv4(),
                    message: `Node has invalid port mappings: ${invalidPorts.join(", ")}.`,
                    nodeId: unikernel.id,
                    details: { ports: invalidPorts }
                });
            }

            const invalidVolumes: any[] = this.checkUniKernelVolumes(unikernel);
            if (invalidVolumes.length > 0) {
                reporter.report({
                    id: uuidv4(),
                    message: `Node has invalid volumes: ${invalidVolumes.join(", ")}.`,
                    nodeId: unikernel.id,
                    details: { volumes: invalidVolumes }
                });
            }

            const invalidTargets: any[] = this.checkUniKernelTargets(unikernel);
            if (invalidTargets.length > 0) {
                reporter.report({
                    id: uuidv4(),
                    message: `Node has invalid targets: ${invalidTargets.join(", ")}.`,
                    nodeId: unikernel.id,
                    details: { targets: invalidTargets }
                });
            }

            const invalidEnvVars: any[] = this.checkUniKernelEnvVars(unikernel);
            if (invalidEnvVars.length > 0) {
                reporter.report({
                    id: uuidv4(),
                    message: `Node has invalid environment variables: ${invalidEnvVars.join(", ")}.`,
                    nodeId: unikernel.id,
                    details: { envVars: invalidEnvVars }
                });
            }

            const validMemory: boolean = this.checkUniKernelMemory(unikernel);
            if (!validMemory) {
                reporter.report({
                    id: uuidv4(),
                    message: `Node has invalid memory data: ${unikernel.memory}.`,
                    nodeId: unikernel.id,
                    details: { memory: unikernel.memory }
                });
            }

            // Event specific checks.
            if (node.type === EShapeType.EVENT) {
                const validTopic: boolean = this.checkEventTopic(unikernel);
                if (!validTopic) {
                    reporter.report({
                        id: uuidv4(),
                        message: `Node has an invalid topic: ${unikernel.topic}.`,
                        nodeId: unikernel.id,
                        details: { topic: unikernel.topic }
                    });
                }
            }
        }
    }


    visitEdge(edgeType: ELineType, from: Node, to: Node, _graph: Graph, reporter: ErrorReporter): void {
        // Rule 5: No self-loops
        if (from.id === to.id) {
            reporter.report({
                id: uuidv4(),
                message: `Self-loop detected. Node connects to itself.`,
                nodeId: from.id,
            });
        }

        // Rule 4: Only one edge allowed between two distinct nodes
        const edgeKey = [from.id, to.id].sort().join("-");
        if (this.seenEdges.has(edgeKey)) {
            reporter.report({
                id: uuidv4(),
                message: `Duplicate edge detected between this node and '${to.name}' (${displayTypeNames.get(to.type)}).`,
                nodeId: from.id,
            });
        } 
        else this.seenEdges.add(edgeKey);

        // Rule 1–3 + implicit Rule 7 (all else is invalid):
        const allowed = allowedConnections[from.type]?.[to.type] ?? [];
        if (!allowed.includes(edgeType)) {
            reporter.report({
                id: uuidv4(),
                message: `Invalid connection from this node to ${to.name} (${displayTypeNames.get(to.type)}) with ${edgeType} link.`,
                nodeId: from.id,
            });
        }

        // Rule 6: DS can only have one HL
        if (edgeType === ELineType.HARD_LINK) {
            if (to.type === EShapeType.DATA_SOURCE) {
                const count = this.hardLinkCounts.get(to.id) ?? 0;
                if (count >= 1) {
                    reporter.report({
                        id: uuidv4(),
                        message: `This data source already has a hard link. Multiple hard links are not permitted.`,
                        nodeId: to.id,
                    });
                } else this.hardLinkCounts.set(to.id, count + 1);
            }
            if (from.type === EShapeType.DATA_SOURCE) {
                const count = this.hardLinkCounts.get(from.id) ?? 0;
                if (count >= 1) {
                    reporter.report({
                        id: uuidv4(),
                        message: `This data source already has a hard link. Multiple hard links are not permitted.`,
                        nodeId: from.id,
                    });
                } else this.hardLinkCounts.set(from.id, count + 1);
            }
        }
    }

    // Resets state before analyzing a new graph.
    enterGraph(_graph: Graph): void {
        this.seenEdges = new Set<string>();
        this.hardLinkCounts = new Map<string, number>();
    }

    exitGraph(_graph: Graph): void {

    }


    // Common fields for all nodes.
    checkNodeName(node: Node): boolean {
        if (!node.name || node.name.length === 0 || !isAlphanumeric(node.name)) return false;
        return true;
    }


    // DataSource specific fields.
    checkDataSourcePath(node: IDataSource): boolean {
        if (!node.path || node.path.length === 0 || !checkPathFormat(node.path)) return false;
        return true;
    }

    checkDataSourceResourceName(node: IDataSource): boolean {
        if (!node.resourceName || node.resourceName.length === 0 || !isAlphanumeric(node.resourceName)) return false;
        return true;
    }

    checkDataSourceDataType(node: IDataSource): boolean {
        if (!node.dataType) node.dataType = "file";
        else if ((node.dataType !== "file" && node.dataType !== "folder")) return false;
        return true;
    }

    checkDataSourceDescription(_node: IDataSource): boolean {
        // There are no specific restrictions for description.
        return true;
    }


    // StoredProcedure, EventTrigger, Event specific fields.
    checkUniKernelImage(node: IUniKernel): boolean {
        if (!node.image || node.image.length === 0 || !checkImageFormat(node.image)) return false;
        return true;
    }

    checkUniKernelArgs(_node: IUniKernel): boolean {
        // There are no specific restrictions for args.
        return true;
    }

    checkUniKernelPrefix(node: IUniKernel): boolean {
        if (!node.prefix || node.prefix.length === 0) return true;
        else if (!isAlphanumeric(node.prefix)) return false;
        return true;
    }

    checkUniKernelDisableVirt(node: IUniKernel): boolean {
        if (!node.disableVirt) node.disableVirt = false;
        return true;
    }

    checkUniKernelRunDetached(node: IUniKernel): boolean {
        if (!node.runDetached) node.runDetached = false;
        return true;
    }

    checkUniKernelRemoveOnStop(node: IUniKernel): boolean {
        if (!node.removeOnStop) node.removeOnStop = false;
        return true;
    }

    checkUniKernelNetworks(node: IUniKernel): any[] {
        if (!node.networks || node.networks.length === 0) return [];

        let invalidEntries = [];
        for (const [_index, network] of node.networks.entries()) {
            if (!checkNetworkFormat(network)) invalidEntries.push(network);
        }
        return invalidEntries;
    }

    checkUniKernelPorts(node: IUniKernel): any[] {
        if (!node.ports || node.ports.length === 0) return [];

        let invalidEntries = [];
        for (const [_index, portMapping] of node.ports.entries()) {
            if (!checkPortMappingFormat(portMapping)) invalidEntries.push(portMapping);
        }
        return invalidEntries;
    }

    checkUniKernelVolumes(node: IUniKernel): any[] {
        if (!node.volumes || node.volumes.length === 0) return [];

        let invalidEntries = [];
        for (const [_index, volume] of node.volumes.entries()) {
            if (!checkVolumeFormat(volume)) invalidEntries.push(volume);
        }
        return invalidEntries;
    }

    checkUniKernelTargets(node: IUniKernel): any[] {
        if (!node.targets || node.targets.length === 0) return [];

        let invalidEntries = [];
        for (const [_index, target] of node.targets.entries()) {
            if (!checkTargetFormat(target)) invalidEntries.push(target);
        }
        return invalidEntries;
    }

    checkUniKernelEnvVars(node: IUniKernel): any[] {
        if (!node.envVars || node.envVars.length === 0) return [];

        let invalidEntries = [];
        for (const [_index, envVar] of node.envVars.entries()) {
            if (!checkEnvironmentVariableFormat(envVar)) invalidEntries.push(envVar);
        }
        return invalidEntries;
    }

    checkUniKernelMemory(node: IUniKernel): boolean {
        if (!node.memory || node.memory.length === 0) return true;
        else if (!checkMemoryFormat(node.memory)) return false;
        return true;
    }

    // Event specific fields.
    checkEventTopic(node: IUniKernel): boolean {
        if (!node.topic || node.topic.length === 0 || !isAlphanumeric(node.topic)) return false;
        return true;
    }
}