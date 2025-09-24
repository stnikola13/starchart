import type { Node, Graph, IDataSource, IShape } from "../shapes/types";
import { isAlphanumeric } from "./AnalysisUtils";
import type { ErrorReporter } from "./ErrorReporter";
import type { GraphVisitor } from "./GraphVisitor";
import { v4 as uuidv4 } from "uuid";

export class SemanticVisitor implements GraphVisitor {
    visitNode(node: Node, graph: Graph, reporter: ErrorReporter): void {
        // Common checks for all nodes.
        const validName: boolean = this.checkNodeName(node);
        if (!validName) {
            reporter.report({
                id: uuidv4(),
                message: `Node with ID ${node.id} has an invalid name ('${node.name}').`,
                nodeId: node.id,
                details: { name: node.name }
            });
        }

        // DataSource specific checks.
        if (node.type === "data_source") {
            const data_source = node as IDataSource;

            const validPath: boolean = this.checkDataSourcePath(data_source);
            if (!validPath) {
                reporter.report({
                    id: uuidv4(),
                    message: `Node with ID ${data_source.id} has an invalid path ('${data_source.path}').`,
                    nodeId: data_source.id,
                    details: { path: data_source.path }
                });
            }

            const validResourceName: boolean = this.checkDataSourceResourceName(data_source);
            if (!validResourceName) {
                reporter.report({
                    id: uuidv4(),
                    message: `Node with ID ${data_source.id} has an invalid resource name ('${data_source.resourceName}').`,
                    nodeId: data_source.id,
                    details: { resourceName: data_source.resourceName }
                });
            }

            const validDataType: boolean = this.checkDataSourceDataType(data_source);
            if (!validDataType) {
                reporter.report({
                    id: uuidv4(),
                    message: `Node with ID ${data_source.id} has an invalid data type ('${data_source.dataType}').`,
                    nodeId: data_source.id,
                    details: { dataType: data_source.dataType }
                });
            }

            const validDescription: boolean = this.checkDataSourceDescription(data_source);
            if (!validDescription) {
                reporter.report({
                    id: uuidv4(),
                    message: `Node with ID ${data_source.id} has an invalid description ('${data_source.description}').`,
                    nodeId: data_source.id,
                    details: { description: data_source.description }
                });
            }
        }
        // StoredProcedure, EventTrigger, Event specific checks.
        else {
            
        }
    }

    // Common fields for all nodes.
    checkNodeName(node: Node): boolean {
        if (!node.name || node.name.length === 0 || !isAlphanumeric(node.name)) {
            return false;
        }
        return true;
    }

    // DataSource specific fields.
    checkDataSourcePath(node: IDataSource): boolean {
        if (!node.path || node.path.length === 0 || !isAlphanumeric(node.path)) {
            return false;
        }
        return true;
    }

    checkDataSourceResourceName(node: IDataSource): boolean {
        if (!node.resourceName || node.resourceName.length === 0 || !isAlphanumeric(node.resourceName)) {
            return false;
        }
        return true;
    }

    checkDataSourceDataType(node: IDataSource): boolean {
        if (!node.dataType || (node.dataType !== "file" && node.dataType !== "folder")) {
            return false;
        }
        return true;
    }

    checkDataSourceDescription(node: IDataSource): boolean {
        // There are no specific restrictions for description.
        return true;
    }
}