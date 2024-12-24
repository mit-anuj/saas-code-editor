import React, { useState } from "react";
import { useCodeEditorStore } from "../../../store/useCodeEditorStore";
import { useMutation } from "convex/react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../../../../convex/_generated/api";

const ShareSnippetDialog = ({ onClose }) => {
  const [title, setTitle] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const {language, getCode} = useCodeEditorStore();
  const createSnippet = useMutation(api.snippets.createSnippet);

  const handleShare = async (e) => {
    e.preventDefault();
    setIsSharing(true);

    try {
        const code = getCode();
        await createSnippet({language,code,title});
        onClose();
        setTitle('');
        toast.success('Snippet shared successfully');
    } catch (error) {
        console.log("Error creating snippet",error);
        toast.error('Error creating snippet')
    }finally{
        setIsSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#1e1e2e] rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between m-4">
          <h2 className="text-xl font-semibold text-white"> Share Snippet</h2>
          <button
            className="text-gray-400 hover:text-gray-300"
            onClick={onClose}
          >
            <X className="size-5" />
          </button>
        </div>
        <form onSubmit={handleShare}>
          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-400 mb-2"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-[#181825] border border-[#313244] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter snippet here"
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              className="px-4 py-2 text-gray-400 hover:text-gray-300"
              type="button"
              onClick={onClose}
              disabled={isSharing}
            >
              Cancel
            </button>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disables:opacity-50">
              {isSharing ? "Sharing..." : "Share"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShareSnippetDialog;
