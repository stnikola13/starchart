import React, { useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import type { Diagnostic } from "../semantics/ErrorReporter";
import type { Node } from "../shapes/types";
import { displayTypeNames } from "../semantics/constants";


interface SemanticAnalysisModalProps {
  open: boolean;
  onClose: () => void;
  initial: Map<string, [Node, Diagnostic[]]>; 
}

export const SemanticAnalysisModal: React.FC<SemanticAnalysisModalProps> = ({
  open,
  onClose,
  initial,
}) => {
  const [data, setData] = useState<Map<string, [Node, Diagnostic[]]>>(initial);

  React.useEffect(() => {
    setData(initial);
  }, [initial]);

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center">
        <DialogPanel className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <DialogTitle className="text-lg font-bold mb-4 text-black">
            Validity report
          </DialogTitle>
            {data.size === 0 ? (
              <label className="block text-black text-sm font-medium mb-1">
                No issues found. The graph is semantically valid.
              </label>
            ) : (
              <div>
                {Array.from(data.entries()).map(([nodeId, [node, diags]]) => (
                  <div key={nodeId} className="mb-4">
                    <h3 className="font-semibold text-black mb-2">
                      Node '{node.name}' ({displayTypeNames.get(node.type)} with ID {nodeId})
                    </h3>
                    {diags.map((d, idx) => (
                      <label
                        key={idx}
                        className={`block text-sm font-medium mb-1 ${
                          d.severity === "error" ? "text-red-600" : "text-yellow-600"
                        }`}
                      >
                        {idx + 1}. {d.message}
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-center mt-4">
                <button type="button" className="px-3 py-1 mt-3 rounded bg-blue-600 text-white" onClick={onClose}>OK</button>
            </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};
