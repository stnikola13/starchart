import React, { useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

interface SemanticAnalysisModalProps {
  open: boolean;
  onClose: () => void;
  initial: string[]; 
}

export const SemanticAnalysisModal: React.FC<SemanticAnalysisModalProps> = ({
  open,
  onClose,
  initial,
}) => {
  const [data, setData] = useState<string[]>(initial);

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
            <div>
                {data.map((message,idx)=>(
                    <div key={idx}>
                        <label className="block text-black text-sm font-medium mb-1">
                            {(idx+1) + ". " + message}
                        </label>
                    </div>
                ))}
            </div>
            <div className="flex justify-center mt-4">
                <button type="button" className="px-3 py-1 rounded bg-blue-600 text-white" onClick={onClose}>OK</button>
            </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
};
