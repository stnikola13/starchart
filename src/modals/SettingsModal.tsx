import React, { useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { type ISettings } from "../shapes/types";
import { checkChartLabelFormat, checkChartMaintainerFormat, checkChartNameFormat } from "../semantics/formatUtils";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: ISettings) => void;
  initial: ISettings;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  open,
  onClose,
  onSubmit,
  initial
}) => {
  const [data, setData] = useState<ISettings>(initial);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [labelInput, setLabelInput] = useState<string>("");
  const [labels, setLabels] = useState<string[]>(initial.labels || []);

  React.useEffect(() => {
    setData(initial);
    setLabels(initial.labels || []);
  }, [initial]);

  const addToList = (
    input: string,
    setInput: React.Dispatch<React.SetStateAction<string>>,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (input.trim()) {
      setList([...list, input.trim()]);
      setInput("");
    }
  };

  const removeFromList = (
    index: number,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setList(list.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center">
        <DialogPanel className="bg-white rounded-lg shadow-lg p-6 w-full overflow-y-auto max-w-md">
          <DialogTitle className="text-lg font-bold mb-4 text-black">
            Chart Settings
          </DialogTitle>
          <form
            onSubmit={(e) => {
              e.preventDefault();

              const errorMsg = checkChartDataValidity(data, labels);
              if (errorMsg) {
                setErrorMessage(errorMsg);
              }
              else {
                setErrorMessage("");
                onSubmit({
                  ...initial,
                  name: data?.name!,
                  maintainer: data?.maintainer!,
                  description: data?.description!,
                  labels: labels!,
                  engine: data?.engine!,
                  visibility: data?.visibility!
                });
                onClose();
              }
            }}
          >
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1 text-black">
                Name
              </label>
              <input
                className="w-full border rounded px-2 py-1 text-black"
                value={data?.name}
                onChange={(e) => setData({ ...data!, name: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1 text-black">
                Maintainer
              </label>
              <input
                className="w-full border rounded px-2 py-1 text-black"
                value={data?.maintainer}
                onChange={(e) => setData({ ...data!, maintainer: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm text-black font-medium mb-1">
                Visibility
              </label>
              <div className="flex gap-8">
                <label className="flex items-center gap-2 text-black">
                    <input
                    type="radio"
                    name="visibility"
                    value="public"
                    checked={data?.visibility === "public"}
                    onChange={() =>
                        setData({ ...data!, visibility: "public" })
                    }
                    />
                    Public
                </label>
                <label className="flex items-center gap-2 text-black">
                    <input
                    type="radio"
                    name="visibility"
                    value="private"
                    checked={data?.visibility === "private"}
                    onChange={() =>
                        setData({ ...data!, visibility: "private" })
                    }
                    />
                    Private
                </label>
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-sm text-black font-medium mb-1">
                Engine
              </label>
              <select
                className="w-full border text-black text-black rounded px-2 py-1"
                value={data?.engine}
                onChange={(e) =>
                  setData({
                    ...data!,
                    engine: e.target.value as string,
                  })
                }
              >
                <option value="unikraft">Unikraft</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1 text-black">
                Labels
              </label>
              <div className="flex gap-2 mb-1">
                <input
                  className="flex-1 border rounded px-2 py-1 text-black"
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  placeholder="label=value"
                />
                <button
                  type="button"
                  className="px-2 py-1 bg-gray-200 rounded text-black"
                  onClick={() =>
                    addToList(
                      labelInput,
                      setLabelInput,
                      labels,
                      setLabels
                    )
                  }
                >
                  Add
                </button>
              </div>
              {labels.map((label, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm mb-1 text-black"
                >
                  <span>{label}</span>
                  <button
                    type="button"
                    className="text-red-500"
                    onClick={() => removeFromList(i, labels, setLabels)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1 text-black">
                Description
              </label>
              <input
                className="w-full border rounded px-2 py-1 text-black"
                value={data?.description}
                onChange={(e) => setData({ ...data!, description: e.target.value })}
              />
            </div>
            {(errorMessage) && (
              <div className="flex justify-center mb-3 mt-5">
                <label className="block text-sm font-medium mb-1 text-red-500">
                  {errorMessage}
                </label>
              </div>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                className="px-3 py-1 rounded border text-black"
                onClick={() => {
                    onClose();
                    setData(initial);
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 rounded bg-blue-600 text-white"
              >
                Save
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

function checkChartDataValidity(data: ISettings, labels: string[]): string {
  let errorMessage = "";

  if (!data.name) {
    errorMessage = "Chart name cannot be empty.";
  }
  else if (!checkChartNameFormat(data.name)) {
    errorMessage = "Chart name contains invalid characters.";
  }
  else if (!data.maintainer) {
    errorMessage = "Chart maintainer has to be defined.";
  }
  else if (!checkChartMaintainerFormat(data.maintainer)) {
    errorMessage = "Chart maintainer name contains invalid characters.";
  }
  else {
    for (const label of labels || []) {
      if (!checkChartLabelFormat(label)) {
        errorMessage = `Label "${label}" is not properly formatted. Use "key=value" format.`;
        break;
      }
    }
  }

  return errorMessage;
}