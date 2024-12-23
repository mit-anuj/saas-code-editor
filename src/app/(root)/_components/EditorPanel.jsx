"use client";
import { useEffect, useState } from "react";
import { useCodeEditorStore } from "../../../store/useCodeEditorStore";
import { LANGUAGE_CONFIG } from "../_constants";
import Image from "next/image";
import { RotateCcwIcon, ShareIcon, TypeIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Editor } from "@monaco-editor/react";
import { defineMonacoThemes } from "../_constants";
import { useClerk } from "@clerk/nextjs";
import {EditorPanelSkeleton} from "./EditorPanelSkeleton";
import useMounted from "../../../hooks/useMounted";

const EditorPanel = () => {
  const [isSharedDialogUpen, setIsSharedDialogOpen] = useState(false);
  const { language, theme, fontSize, editor, setFontSize, setEditor } =
    useCodeEditorStore();
  const clerk = useClerk();
  const mounted = useMounted();
  useEffect(() => {
    const savedCode = localStorage.getItem(`editor-code-${language}`);
    const newCode = savedCode || LANGUAGE_CONFIG[language].defaultCode;
    if (editor) editor.setValue(newCode);
  }, [editor, language]);

  useEffect(() => {
    const savedFontSize = localStorage.getItem("font-size");
    if (savedFontSize) setFontSize(parseInt(savedFontSize));
  }, [setFontSize]);

  if (!mounted) return null;

  const handleRefresh = ( ) => {
    const defaultCode = LANGUAGE_CONFIG[language].defaultCode;
    if(editor) editor.setValue(defaultCode);
    localStorage.removeItem(`editor-code-${language}`);
  };

  const handleEditorChange = (value) => {
    if(value){
        console.log(value);
        localStorage.setItem(`editor-code-${language}`,value);
    }
  };

  const handleFontSizeChange = (newSize) => {
    const size = Math.min(Math.max(newSize,12),24);
    setFontSize(size);
    localStorage.setItem("font-size",size.toString());
  };
  return (
    <div className="relative">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1e1e2e] ring-1 ring-white/5">
              <Image
                src={"/" + language + ".png"}
                alt="Logo"
                width={24}
                height={24}
              />
            </div>
            <div>
              <h2 className="text-sm font-medium text-white">Code Editor</h2>
              <p className="text-xs text-gray-500">
                Write and execute your code
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Font Size Slider */}
            <div className="flex items-center gap-3 px-3 py-2 bg-[#1e1e2e] rounded-lg ring-1 ring-white/5">
              <TypeIcon className="size-4 text-gray-400" />
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={fontSize}
                  onChange={(e) =>
                    handleFontSizeChange(parseInt(e.target.value))
                  }
                  className="w-20 h-1 bg-gray-600 rounded-lg cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-400 min-w-[2rem] text-center">
                  {fontSize}
                </span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              className="p-2 bg-[#1e1e2e] hover:bg-[#2a2a3a] rounded-lg ring-1 ring-white/5 transition-colors"
              aria-label="Reset to default code"
            >
              <RotateCcwIcon className="size-4 text-gray-400" />
            </motion.button>
            {/* Share Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsShareDialogOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg overflow-hidden bg-gradient-to-r
               from-blue-500 to-blue-600 opacity-90 hover:opacity-100 transition-opacity"
            >
              <ShareIcon className="size-4 text-white" />
              <span className="text-sm font-medium text-white ">Share</span>
            </motion.button>
          </div>
        </div>

        {/* Editor */}
        {clerk.loaded && (
          <div className="relative group rounded-e-xl overflow-hidden ring-1 ring-white/[0.05]">
            <Editor
              height="600px"
              language={LANGUAGE_CONFIG[language].monacoLanguage}
              onChange={handleEditorChange}
              theme={theme}
              beforeMount={defineMonacoThemes}
              onMount={(editor) => setEditor(editor)}
              options={{
                minimap: { enabled: false },
                fontSize,
                automaticLayout: true,
                scrollBeyondLastLine: false,
                padding: { top: 16, bottom: 16 },
                renderWhiteSpace: "selection",
                fontFamily: '"Fire Code", "Cascadia Code",Consolas,monospace',
                fontLigatures: true,
                cursorBlinking: "smooth",
                smoothScrolling: true,
                contextmenu: true,
                renderLineHeighlight: "all",
                lineHeight: 1.6,
                letterSpacing: 0.5,
                roundedSelection: true,
                scrollbar: {
                  verticalScrollbarSize: 8,
                  horizonalScrollbarSize: 8,
                },
              }}
            />
          </div>
        )}
        {!clerk.loaded && <EditorPanelSkeleton />}
      </div>
    </div>
  );
};

export default EditorPanel;
