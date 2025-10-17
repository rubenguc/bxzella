import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { useEffect, useMemo } from "react";
import ToolbarPlugin from "./toolbar-plugin";

const EMPTY_CONTENT =
  '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}';

function MyOnChangePlugin({ onChange }: { onChange: (value: string) => void }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      onChange(JSON.stringify(editorState.toJSON()));
    });
  }, [editor, onChange]);
  return null;
}

interface TextEditorProps {
  initialValue: string;
  onChange: (value: string) => void;
}

export function TextEditor({ onChange, initialValue }: TextEditorProps) {
  const editorState = useMemo(() => {
    return initialValue || EMPTY_CONTENT;
  }, [initialValue]);

  return (
    <LexicalComposer
      initialConfig={{
        namespace: "notebooks-details",
        onError: (error) => {
          console.error(error);
        },
        editorState,
      }}
    >
      <ToolbarPlugin />
      <div className="flex flex-1 relative">
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className="flex-1 p-2 mt-3 outline-0! relative"
              aria-placeholder={"Enter some text..."}
              placeholder={
                <p className="text-[#999] overflow-hidden absolute text-ellipsis top-[15px] left-[10px] text-[15px] select-none inline-block pointer-events-none">
                  {"entre some text..."}
                </p>
              }
            />
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
      </div>
      <HistoryPlugin />
      <MyOnChangePlugin onChange={onChange} />
    </LexicalComposer>
  );
}
