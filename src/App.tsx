import { v4 as uuidv4 } from "uuid";
import type { KonvaEventObject } from "konva/lib/Node";
import { useRef, useState } from "react";
import { Stage, Layer, Line, Arrow } from "react-konva";
import DataSource from "./shapes/DataSource";
import StoredProcedure from "./shapes/StoredProcedure";
import Event from "./shapes/Event";
import EventTrigger from "./shapes/EventTrigger";
import { DataSourceModal } from "./modals/DataSourceModal";
import { UniKernelModal } from "./modals/UniKernelModal";
import type { IShape, ILine, Node, ISettings } from "./shapes/types";
import { EShapeType } from "./shapes/types";
import { startCase } from "lodash";
import { SemanticAnalysisModal } from "./modals/SemanticAnalysisModal";
import { checkSemanticAnalysisSuccess, downloadYaml, performGraphSerialization } from "./semantics/Serialization";
import { performGraphSemanticAnalysis } from "./semantics/Serialization";
import { getGraphEdges, performGraphDeserialization } from "./semantics/Deserialization";
import { MessageModal } from "./modals/MessageModal";
import type { Diagnostic } from "./semantics/DiagnosticReporter";
import { SettingsModal } from "./modals/SettingsModal";

const SHAPE_WIDTH = 120;
const SHAPE_HEIGHT = 60;

function App() {
  const [shapes, setShapes] = useState<IShape[]>([]);
  const [lines, setLines] = useState<ILine[]>([]);
  const [softLines, setSoftLines] = useState<ILine[]>([]);
  const [eventLines, setEventLines] = useState<ILine[]>([]);
  const [connectMode, setConnectMode] = useState(false);
  const [connectSoftMode, setConnectSoftMode] = useState(false);
  const [connectEventMode, setConnectEventMode] = useState(false);
  const [connectStartId, setConnectStartId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingShape, setEditingShape] = useState<IShape | null>(null);

  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [semanticAnalysisReport, setSemanticAnalysisReport] = useState<Map<Node, Diagnostic[]>>(new Map());
  const [deserializationError, setDeserializationError] = useState<string>("");

  const [yamlContent, setYamlContent] = useState<string>("");
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settings, setSettings] = useState<ISettings>({
    apiVersion: "v1",
    schemaVersion: "v1",
    kind: "StarChart",
    engine: "unikraft",
    visibility: "public",
    name: "Untitled Chart",
    maintainer: "Anonymous",
    description: "",
    labels: []
  });

  // Used for YAML file upload.
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addShape = (type: EShapeType) => {
    const newShape: IShape = {
      id: uuidv4(),
      type,
      x: 100,
      y: 100,
      name: startCase(type),
      isSelected: false,
    };
    setShapes([...shapes, newShape]);
  };

  // Drag logic
  const handleDragMove = (id: string, e: KonvaEventObject<DragEvent>) => {
    const { x, y } = e.target.position();
    setShapes(
      shapes.map((shape) =>
        shape.id === id ? { ...shape, x: x, y: y } : shape
      )
    );
  };

  // Handle shape click for connecting
  const handleShapeClick = (id: string) => {
    setSelectedId(id);
    if (!connectMode && !connectSoftMode && !connectEventMode) return;
    if (!connectStartId) {
      setConnectStartId(id);
    } else if (connectStartId !== id) {
      if (connectSoftMode) {
        setSoftLines([
          ...softLines,
          { id: uuidv4(), from: connectStartId, to: id },
        ]);
        shapes.map((shape) => {
          if (shape.id === connectStartId) {
            if (shape.softConnectedTo) {
              shape.softConnectedTo.push(id);
            } else {
              shape.softConnectedTo = [id];
            }
          }
        });
        setConnectSoftMode(false);
      } else if (connectEventMode) {
        setEventLines([
          ...eventLines,
          { id: uuidv4(), from: connectStartId, to: id },
        ]);
        shapes.map((shape) => {
          if (shape.id === connectStartId) {
            if (shape.eventConnectedTo) {
              shape.eventConnectedTo.push(id);
            } else {
              shape.eventConnectedTo = [id];
            }
          }
        });
        setConnectEventMode(false);
      } else {
        setLines([...lines, { id: uuidv4(), from: connectStartId, to: id }]);
        shapes.map((shape) => {
          if (shape.id === connectStartId) {
            if (shape.connectedTo) {
              shape.connectedTo.push(id);
            } else {
              shape.connectedTo = [id];
            }
          }
        });
        setConnectMode(false);
      }
      setConnectStartId(null);
    }
  };

  // Double click handler
  const handleShapeDoubleClick = (id: string) => {
    setEditingId(id);
    const shape = shapes.find((s) => s.id === id) || null;
    setEditingShape(shape);
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    setShapes(shapes.filter((shape) => shape.id !== selectedId));
    setLines(
      lines.filter((line) => line.from !== selectedId && line.to !== selectedId)
    );
    setSoftLines(
      softLines.filter(
        (line) => line.from !== selectedId && line.to !== selectedId
      )
    );
    setSelectedId(null);
  };

  // Render shapes
  const renderShape = (shape: IShape) => {
    switch (shape.type) {
      case EShapeType.EVENT:
        return (
          <Event
            key={shape.id}
            shape={shape}
            selectedId={selectedId}
            handleDragMove={handleDragMove}
            handleShapeClick={handleShapeClick}
            handleShapeDoubleClick={handleShapeDoubleClick}
          />
        );
      case EShapeType.EVENT_TRIGGER:
        return (
          <EventTrigger
            key={shape.id}
            shape={shape}
            selectedId={selectedId}
            handleDragMove={handleDragMove}
            handleShapeClick={handleShapeClick}
            handleShapeDoubleClick={handleShapeDoubleClick}
          />
        );
      case EShapeType.STORED_PROCEDURE:
        return (
          <StoredProcedure
            key={shape.id}
            shape={shape}
            selectedId={selectedId}
            handleDragMove={handleDragMove}
            handleShapeClick={handleShapeClick}
            handleShapeDoubleClick={handleShapeDoubleClick}
          />
        );
      case EShapeType.DATA_SOURCE:
        return (
          <DataSource
            key={shape.id}
            shape={shape}
            selectedId={selectedId}
            handleDragMove={handleDragMove}
            handleShapeClick={handleShapeClick}
            handleShapeDoubleClick={handleShapeDoubleClick}
          />
        );
    }
  };

  // Render lines/arrows
  const renderLines = () => {
    return lines.map((line: ILine) => {
      const from = shapes.find((s) => s.id === line.from);
      const to = shapes.find((s) => s.id === line.to);
      if (!from || !to) return null;
      const fromX = from.x + SHAPE_WIDTH / 2;
      const fromY = from.y + SHAPE_HEIGHT / 2;
      const toX = to.x + SHAPE_WIDTH / 2;
      const toY = to.y + SHAPE_HEIGHT / 2;
      return (
        <Line
          key={line.id}
          points={[fromX, fromY, toX, toY]}
          stroke="black"
          strokeWidth={2}
        />
      );
    });
  };

  const renderSoftLines = () => {
    return softLines.map((line: ILine) => {
      const from = shapes.find((s) => s.id === line.from);
      const to = shapes.find((s) => s.id === line.to);
      if (!from || !to) return null;
      const fromX = from.x + SHAPE_WIDTH / 2;
      const fromY = from.y + SHAPE_HEIGHT / 2;
      const toX = to.x + SHAPE_WIDTH / 2;
      const toY = to.y + SHAPE_HEIGHT / 2;
      return (
        <Line
          key={line.id}
          points={[fromX, fromY, toX, toY]}
          stroke="black"
          dash={[10, 5]}
          strokeWidth={2}
        />
      );
    });
  };

  const renderEventLines = () => {
    return eventLines.map((line: ILine) => {
      const from = shapes.find((s) => s.id === line.from);
      const to = shapes.find((s) => s.id === line.to);
      if (!from || !to) return null;
      const fromX = from.x + SHAPE_WIDTH / 2;
      const fromY = from.y + SHAPE_HEIGHT / 2;
      const toX = to.x;
      const toY = to.y + SHAPE_HEIGHT;
      return (
        <Arrow
          key={line.id}
          points={[fromX, fromY, toX, toY]}
          stroke="black"
          fill={"black"}
          strokeWidth={2}
          pointerLength={10}
          pointerWidth={10}
        />
      );
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        const graph = performGraphDeserialization(content);

        // If an error occurred during reconstruction.
        if (graph.length == 0) {
          setDeserializationError("Could not reconstruct graph. Check file format.");
          setShowMessageModal(true);
          return;
        }

        // Graph successfully reconstructed. Checking semantic validity.
        const semanticAnalysisResults = performGraphSemanticAnalysis(graph);
        const semanticCheck = checkSemanticAnalysisSuccess(semanticAnalysisResults);
        if (semanticCheck) {
          const edges = getGraphEdges(graph);
          setShapes(graph);
          setLines(edges.lines);
          setSoftLines(edges.softLines);
          setEventLines(edges.eventLines);

          setDeserializationError("Graph successfully reconstructed!");
          setShowMessageModal(true);
        }
        // If semantic analysis failed, show semantic analysis report.
        else {
          setDeserializationError("");
          setSemanticAnalysisReport(semanticAnalysisResults);
          setShowAnalysisModal(true);
        }
      }
    };
    reader.onerror = () => {
      alert('Error reading file.');
    };

    reader.readAsText(file);
  };

  return (
    <div style={{ position: "relative" }}>
      <div className="flex gap-2 p-2 justify-center">
        <button onClick={() => addShape(EShapeType.STORED_PROCEDURE)}>
          Add Stored Procedure
        </button>
        <button onClick={() => addShape(EShapeType.EVENT_TRIGGER)}>
          Add Event Trigger
        </button>
        <button onClick={() => addShape(EShapeType.EVENT)}>Add Event</button>
        <button onClick={() => addShape(EShapeType.DATA_SOURCE)}>
          Add Data Source
        </button>
        <button
          onClick={() => {
            setConnectMode(true);
            setConnectStartId(null);
          }}
          style={{ background: connectMode ? "orange" : "" }}
        >
          Connect Shapes
        </button>
        <button
          onClick={() => {
            setConnectSoftMode(true);
            setConnectStartId(null);
          }}
          style={{ background: connectSoftMode ? "orange" : "" }}
        >
          Soft Connect Shapes
        </button>
        <button
          onClick={() => {
            setConnectEventMode(true);
            setConnectStartId(null);
          }}
          style={{ background: connectEventMode ? "orange" : "" }}
        >
          Connect Event
        </button>
        <button onClick={deleteSelected}>Delete Shape</button>
        <button className="button-main" onClick={() => {
            fileInputRef.current?.click();
          }}>Load from file
        </button>
        <button className="button-main" onClick={() => {
              setSemanticAnalysisReport(performGraphSemanticAnalysis(shapes));
              const yaml = performGraphSerialization(shapes);
              setYamlContent(yaml);
              if (yaml.length > 0) {
                setShowSettingsModal(true);
              }
              else {
                setShowAnalysisModal(true);
              }
            }}>Save
        </button>
      </div>

      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          {renderLines()}
          {renderSoftLines()}
          {renderEventLines()}
          {shapes.map(renderShape)}
        </Layer>
      </Stage>
      {editingId && editingShape?.type === EShapeType.DATA_SOURCE && (
        <DataSourceModal
          open={!!editingId}
          onClose={() => setEditingId(null)}
          onSubmit={(data) => {
            if (editingShape) {
              const updatedShapes = shapes.map((shape) =>
                shape.id === editingShape.id ? { ...shape, ...data } : shape
              );
              setShapes(updatedShapes);
            }
          }}
          initial={editingShape}
        />
      )}
      {editingId && editingShape?.type !== EShapeType.DATA_SOURCE && (
        <UniKernelModal
          open={!!editingId}
          onClose={() => setEditingId(null)}
          onSubmit={(data) => {
            if (editingShape) {
              const updatedShapes = shapes.map((shape) =>
                shape.id === editingShape.id ? { ...shape, ...data } : shape
              );
              setShapes(updatedShapes);
            }
          }}
          initial={editingShape!}
        />
      )}
      <SemanticAnalysisModal
          open={showAnalysisModal}
          onClose={() => setShowAnalysisModal(false)}
          initial={semanticAnalysisReport}
        />
      <MessageModal
          open={showMessageModal}
          onClose={() => setShowMessageModal(false)}
          initial={deserializationError}
        />
      <SettingsModal
          open={showSettingsModal}
          onClose={() => {
            setShowSettingsModal(false);
          }}
          onSubmit={(data) => {
            setSettings(data); 
            downloadYaml(yamlContent);
          }}
          initial={settings}
        />
      <input type="file" accept=".yaml,.yml" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileUpload} />
    </div>
  );
}

export default App;
