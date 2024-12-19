import { create } from "zustand"

 const getInitialState = () =>{
    // if we are on the server, return default value
    if(typeof window === "undefined"){
        return {
            language:'javascript',
            fontSize: 16,
            theme: 'vs-dark'
        }
    }

    // if we are on the client, return values from the local storage bc localstroage is a brower api.
    const savedLanguage = localStorage.getItem('editor-language') || 'javascript';
    const savedTheme = localStorage.getItem('editor-theme') || 'vs-dark';
    const savedFontSize = localStorage.getItem('editor-font') || 16;

    return {
        language: savedLanguage,
        theme: savedTheme,
        fontSize: Number(savedFontSize)
    }

 }

export const useCodeEditorStore = create((set,get)=>{
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

        setTheme: (theme) =>{
            localStorage.setItem(`editor-theme`,theme);
            set({theme});
        },
        setFontSize: (fontSize) =>{
            localStorage.setItem(`editor-font-size`,fontSize.toString());
            set({fontSize});
        },
        setLanguage: (language) =>{
            //Save the current language code before switching
            const currentCode = get().editor?.getValue();
            if(currentCode){
                localStorage.setItem(`editor-code-${get().language}`,currentCode);
            }
            localStorage.setItem(`editor-Language`,language);
            set({
                language,
                error: null,
                output: '',
            });
        },

        runCode: async() =>{
            // edit later.
        }
    }
})