import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { AutoLinkPlugin, createLinkMatcherWithRegExp } from "@lexical/react/LexicalAutoLinkPlugin";
import { LinkNode, AutoLinkNode } from "@lexical/link";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import ToolbarPlugin from "./toolbar-plugin";

const URL_REGEX = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/;

const EMAIL_REGEX = /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;

const MATCHERS = [
  createLinkMatcherWithRegExp(URL_REGEX, (text) => text),
  createLinkMatcherWithRegExp(EMAIL_REGEX, (text) => `mailto:${text}`),
];

const EMPTY_CONTENT = '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}';

function MyOnChangePlugin({ onChange }: { onChange: (value: string) => void }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      onChange(JSON.stringify(editorState.toJSON()));
    });
  }, [editor, onChange]);

  return null;
}

function SetInitialValuePlugin({
  ref,
}: {
  ref: React.Ref<{ setInitialValue: (value: string) => void }>;
}) {
  const [editor] = useLexicalComposerContext();

  useImperativeHandle(
    ref,
    () => ({
      setInitialValue: (value: string) => {
        const editorState = editor.parseEditorState(value || EMPTY_CONTENT);
        editor.setEditorState(editorState);
      },
    }),
    [editor],
  );

  return null;
}

function EditablePlugin({ disabled }: { disabled: boolean }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  return null;
}

interface TextEditorProps {
  initialValue?: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
}

export interface TextEditorRef {
  setInitialValue: (value: string) => void;
}

const urlRegExp = new RegExp(/(([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[\w]*))?/);

export function validateUrl(url: string): boolean {
  return url === "https://" || urlRegExp.test(url);
}

export const TextEditor = forwardRef<TextEditorRef, TextEditorProps>(
  ({ onChange, initialValue, isLoading }, ref) => {
    const editorConfig = useMemo(
      () => ({
        namespace: "notebooks-details",
        onError: (error: unknown) => {
          console.error(error);
        },
        editorState: initialValue || EMPTY_CONTENT,
        nodes: [LinkNode, AutoLinkNode],
      }),
      [initialValue],
    );

    return (
      <LexicalComposer initialConfig={editorConfig}>
        <ToolbarPlugin />
        <div className="flex flex-1 relative min-h-[200px] rounded-md border">
          <div className="flex-1 relative">
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  className="p-3 outline-none relative min-h-[200px]"
                  aria-placeholder="Enter some text..."
                  placeholder={
                    <p className="text-muted-foreground overflow-hidden absolute text-ellipsis top-3 left-3 text-sm select-none pointer-events-none">
                      Enter some text...
                    </p>
                  }
                />
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
          </div>
        </div>
        <HistoryPlugin />
        <MyOnChangePlugin onChange={onChange} />
        <SetInitialValuePlugin ref={ref} />
        <EditablePlugin disabled={isLoading ?? false} />
        <LinkPlugin validateUrl={validateUrl} />
        <AutoLinkPlugin matchers={MATCHERS} />
      </LexicalComposer>
    );
  },
);

TextEditor.displayName = "TextEditor";
