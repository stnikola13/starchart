import React, { useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { EShapeType, type IUniKernel } from "../shapes/types";

interface UniKernelModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: IUniKernel) => void;
  initial: IUniKernel;
}

export const UniKernelModal: React.FC<UniKernelModalProps> = ({
  open,
  onClose,
  onSubmit,
  initial,
}) => {
  const [data, setData] = useState<IUniKernel>(initial);

  const [networkInput, setNetworkInput] = useState("");
  const [portInput, setPortInput] = useState("");
  const [volumeInput, setVolumeInput] = useState("");
  const [targetInput, setTargetInput] = useState("");
  const [envVarInput, setEnvVarInput] = useState("");
  const [networks, setNetworks] = useState<string[]>(initial.networks || []);
  const [ports, setPorts] = useState<string[]>(initial.ports || []);
  const [volumes, setVolumes] = useState<string[]>(initial.volumes || []);
  const [targets, setTargets] = useState<string[]>(initial.targets || []);
  const [envVars, setEnvVars] = useState<string[]>(initial.envVars || []);

  React.useEffect(() => {
    setData(initial);
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
        <DialogPanel className="bg-white rounded-lg shadow-lg p-6 w-full h-full overflow-y-auto max-w-md">
          <DialogTitle className="text-lg font-bold mb-4 text-black">
            Unikernel Settings
          </DialogTitle>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit({
                ...initial,
                name: data?.name!,
                image: data?.image!,
                kernelArgs: data?.kernelArgs!,
                prefix: data?.prefix!,
                disableVirt: data?.disableVirt!,
                runDetached: data?.runDetached!,
                removeOnStop: data?.removeOnStop!,
                memory: data?.memory!,
                topic: data?.topic!,
                networks: networks!,
                ports: ports!,
                volumes: volumes!,
                targets: targets!,
                envVars: envVars!,
              });
              onClose();
            }}
          >
            {/* One line text inputs */}
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
                Image
              </label>
              <input
                className="w-full border rounded px-2 py-1 text-black"
                value={data?.image}
                onChange={(e) => setData({ ...data!, image: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1 text-black">
                Kernel Arguments
              </label>
              <input
                className="w-full border rounded px-2 py-1 text-black"
                value={data?.kernelArgs}
                onChange={(e) =>
                  setData({ ...data!, kernelArgs: e.target.value })
                }
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1 text-black">
                Prefix
              </label>
              <input
                className="w-full border rounded px-2 py-1 text-black"
                value={data?.prefix}
                onChange={(e) => setData({ ...data!, prefix: e.target.value })}
              />
            </div>

            {initial.type === EShapeType.EVENT && (
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1 text-black">
                  Topic
                </label>
                <input
                  className="w-full border rounded px-2 py-1 text-black"
                  value={data?.topic}
                  onChange={(e) => setData({ ...data!, topic: e.target.value })}
                />
              </div>
            )}

            {/* Checkboxes */}
            <div className="mb-3 flex flex-col gap-1">
              <label className="flex items-center gap-2 text-black">
                <input
                  type="checkbox"
                  checked={data?.disableVirt}
                  onChange={(e) =>
                    setData({ ...data!, disableVirt: e.target.checked })
                  }
                />
                Disable hardware virtualization (-W)
              </label>
              <label className="flex items-center gap-2 text-black">
                <input
                  type="checkbox"
                  checked={data?.runDetached}
                  onChange={(e) =>
                    setData({ ...data!, runDetached: e.target.checked })
                  }
                />
                Run detached (-d)
              </label>
              <label className="flex items-center gap-2 text-black">
                <input
                  type="checkbox"
                  checked={data?.removeOnStop}
                  onChange={(e) =>
                    setData({ ...data!, removeOnStop: e.target.checked })
                  }
                />
                Remove unikernel once stopped (-rm)
              </label>
            </div>

            {/* Multi option lists */}
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1 text-black">
                Networks
              </label>
              <div className="flex gap-2 mb-1">
                <input
                  className="flex-1 border rounded px-2 py-1 text-black"
                  value={networkInput}
                  onChange={(e) => setNetworkInput(e.target.value)}
                  placeholder="kraft0:172.100.0.2"
                />
                <button
                  type="button"
                  className="px-2 py-1 bg-gray-200 rounded text-black"
                  onClick={() =>
                    addToList(
                      networkInput,
                      setNetworkInput,
                      networks,
                      setNetworks
                    )
                  }
                >
                  Add
                </button>
              </div>
              {networks.map((net, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm mb-1 text-black"
                >
                  <span>{net}</span>
                  <button
                    type="button"
                    className="text-red-500"
                    onClick={() => removeFromList(i, networks, setNetworks)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1 text-black">
                Port mappings (A:B)
              </label>
              <div className="flex gap-2 mb-1">
                <input
                  className="flex-1 border rounded px-2 py-1 text-black"
                  value={portInput}
                  onChange={(e) => setPortInput(e.target.value)}
                  placeholder="8000:8000"
                />
                <button
                  type="button"
                  className="px-2 py-1 bg-gray-200 rounded text-black"
                  onClick={() =>
                    addToList(portInput, setPortInput, ports, setPorts)
                  }
                >
                  Add
                </button>
              </div>
              {ports.map((port, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm mb-1 text-black"
                >
                  <span>{port}</span>
                  <button
                    type="button"
                    className="text-red-500"
                    onClick={() => removeFromList(i, ports, setPorts)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1 text-black">
                Volumes (A:B)
              </label>
              <div className="flex gap-2 mb-1">
                <input
                  className="flex-1 border rounded px-2 py-1 text-black"
                  value={volumeInput}
                  onChange={(e) => setVolumeInput(e.target.value)}
                  placeholder="./path/to/dir:/dir"
                />
                <button
                  type="button"
                  className="px-2 py-1 bg-gray-200 rounded text-black"
                  onClick={() =>
                    addToList(volumeInput, setVolumeInput, volumes, setVolumes)
                  }
                >
                  Add
                </button>
              </div>
              {volumes.map((vol, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm mb-1 text-black"
                >
                  <span>{vol}</span>
                  <button
                    type="button"
                    className="text-red-500"
                    onClick={() => removeFromList(i, volumes, setVolumes)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1 text-black">
                Targets (platform/architecture)
              </label>
              <div className="flex gap-2 mb-1">
                <input
                  className="flex-1 border rounded px-2 py-1 text-black"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  placeholder="qemu/x86_64"
                />
                <button
                  type="button"
                  className="px-2 py-1 bg-gray-200 rounded text-black"
                  onClick={() =>
                    addToList(targetInput, setTargetInput, targets, setTargets)
                  }
                >
                  Add
                </button>
              </div>
              {targets.map((target, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm mb-1 text-black"
                >
                  <span>{target}</span>
                  <button
                    type="button"
                    className="text-red-500"
                    onClick={() => removeFromList(i, targets, setTargets)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1 text-black">
                Env vars (key[=value])
              </label>
              <div className="flex gap-2 mb-1">
                <input
                  className="flex-1 border rounded px-2 py-1 text-black"
                  value={envVarInput}
                  onChange={(e) => setEnvVarInput(e.target.value)}
                  placeholder="HELLO=world"
                />
                <button
                  type="button"
                  className="px-2 py-1 bg-gray-200 rounded text-black"
                  onClick={() =>
                    addToList(envVarInput, setEnvVarInput, envVars, setEnvVars)
                  }
                >
                  Add
                </button>
              </div>
              {envVars.map((env, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm mb-1 text-black"
                >
                  <span>{env}</span>
                  <button
                    type="button"
                    className="text-red-500"
                    onClick={() => removeFromList(i, envVars, setEnvVars)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Memory input */}
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1 text-black">
                Memory
              </label>
              <input
                className="w-full border rounded px-2 py-1 text-black"
                value={data?.memory}
                onChange={(e) => setData({ ...data!, memory: e.target.value })}
                placeholder="64Mi"
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                className="px-3 py-1 rounded border text-black"
                onClick={onClose}
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
