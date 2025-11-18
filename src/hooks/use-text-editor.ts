import { useRef } from "react";
import type { TextEditorRef } from "@/components/text-editor/text-editor";

export function useEditorText() {
  const editorRef = useRef<TextEditorRef>(null);

  const setEditorValue = (newValue: string) => {
    editorRef.current?.setInitialValue(newValue);
  };

  return {
    editorRef,
    setEditorValue,
  };
}
