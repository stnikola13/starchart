import React, { useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import type { IDataSource } from "../shapes/types";

interface DataSourceModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: IDataSource) => void;
  initial: IDataSource;
}

export const DataSourceModal: React.FC<DataSourceModalProps> = ({
  open,
  onClose,
  onSubmit,
  initial,
}) => {
  const [data, setData] = useState<IDataSource>(initial);

  React.useEffect(() => {
    setData(initial);
  }, [initial]);

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center">
        <DialogPanel className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <DialogTitle className="text-lg font-bold mb-4 text-black">
            Data Source
          </DialogTitle>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit({
                ...initial!,
                name: data?.name!,
                path: data?.path!,
                resourceName: data?.resourceName!,
                dataType: data?.dataType!,
                description: data?.description!,
              });
              onClose();
            }}
          >
            <div className="mb-3">
              <label className="block text-black text-sm font-medium mb-1">
                Name
              </label>
              <input
                className="w-full border text-black rounded px-2 py-1"
                value={data?.name}
                onChange={(e) => setData({ ...data!, name: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <label className="block text-black text-sm font-medium mb-1">
                Path
              </label>
              <input
                className="w-full border text-black rounded px-2 py-1"
                value={data?.path}
                onChange={(e) => setData({ ...data!, path: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <label className="block text-black text-sm font-medium mb-1">
                Resource Name
              </label>
              <input
                className="w-full border text-black text-black rounded px-2 py-1"
                value={data?.resourceName}
                onChange={(e) =>
                  setData({ ...data!, resourceName: e.target.value })
                }
                required
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm text-black font-medium mb-1">
                Type
              </label>
              <select
                className="w-full border text-black text-black rounded px-2 py-1"
                value={data?.dataType}
                onChange={(e) =>
                  setData({
                    ...data!,
                    dataType: e.target.value as "file" | "folder",
                  })
                }
              >
                <option value="file">File</option>
                <option value="folder">Folder</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-black text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                className="w-full border text-black rounded px-2 py-1"
                value={data?.description}
                onChange={(e) =>
                  setData({ ...data!, description: e.target.value })
                }
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                className="px-3 py-1 rounded border"
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
