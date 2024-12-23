import { create, useStore } from "zustand";
import { LANGUAGE_CONFIG } from "../app/(root)/_constants";

const getInitialState = () => {
  // if we are on the server, return default value
  if (typeof window === "undefined") {
    return {
      language: "javascript",
      fontSize: 16,
      theme: "vs-dark",
    };
  }

  // if we are on the client, return values from the local storage bc localstroage is a brower api.
  const savedLanguage = localStorage.getItem("editor-language") || "javascript";
  const savedTheme = localStorage.getItem("editor-theme") || "vs-dark";
  const savedFontSize = localStorage.getItem("editor-font") || 16;

  return {
    language: savedLanguage,
    theme: savedTheme,
    fontSize: Number(savedFontSize),
  };
};

export const useCodeEditorStore = create((set, get) => {
  const initialState = getInitialState();

  return {
    ...initialState,
    output: "",
    isRunning: false,
    error: null,
    editor: null,
    executionResult: null,

    getCode: () => get().editor?.getValue() || "",

    setEditor: (editor) => {
      const savedCode = localStorage.getItem(`editor-code-${get().language}`);
      if (savedCode) editor.setValue(savedCode);

      set({ editor });
    },

    setTheme: (theme) => {
      localStorage.setItem(`editor-theme`, theme);
      set({ theme });
    },
    setFontSize: (fontSize) => {
      localStorage.setItem(`editor-font-size`, fontSize.toString());
      set({ fontSize });
    },
    setLanguage: (language) => {
      //Save the current language code before switching
      const currentCode = get().editor?.getValue();
      if (currentCode) {
        localStorage.setItem(`editor-code-${get().language}`, currentCode);
      }
      localStorage.setItem(`editor-Language`, language);
      set({
        language,
        error: null,
        output: "",
      });
    },

    runCode: async () => {
      const { language, getCode } = get();
      const code = getCode();
      if (!code) {
        set({ error: "Please enter some code" });
      }
      set({ isRunning: true, error: null, output: "" });

      try {
        const runTime = LANGUAGE_CONFIG[language].pistonRuntime;
        console.log(runTime);
        const response = await fetch('https://emkc.org/api/v2/piston/execute', {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            language: runTime.language,
            version: runTime.version,
            files: [{ content: code }],
          }),
        });
        const data = await response.json();
        //handle API Level Error
        if (data.message) {
          set({
            error: data.message,
            executionResult: { code, output: "", error: data.message },
          });
          return;
        }

        // handle compilation error
        if (data.compile && data.compile.code !== 0) {
          const error = data.compile.stderr || data.compile.output;
          set({ error: error, executionResult: { code, output: "", error } });
          return;
        }
        // handle runtime error
        if (data.run && data.run.code !== 0) {
          const error = data.run.stderr || data.run.output;
          set({ error: error, executionResult: { code, output: "", error } });
          return;
        }

        // if we get here, execution is seccessfull
        const output = data.run.output;
        set({
          output: output.trim(),
          executionResult: { code, output, error: null },
        });
      } catch (error) {
        console.log("error running code : ", error);
        set({
          error: "error running code",
          executionResult: { code, output: "", error: "error running code" },
        });
      }finally {
        set({isRunning: false});
      }
    },
  };
});


export const getExecutionResult =()=>useCodeEditorStore.getState().executionResult;