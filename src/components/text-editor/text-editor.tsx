import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import ToolbarPlugin from "./toolbar-plugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { LinkNode } from "@lexical/link";
import {
  AutoLinkPlugin,
  createLinkMatcherWithRegExp,
} from "@lexical/react/LexicalAutoLinkPlugin";
import { AutoLinkNode } from "@lexical/link";

const URL_REGEX =
  /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/;

const EMAIL_REGEX =
  /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;

const MATCHERS = [
  createLinkMatcherWithRegExp(URL_REGEX, (text) => {
    return text;
  }),
  createLinkMatcherWithRegExp(EMAIL_REGEX, (text) => {
    return `mailto:${text}`;
  }),
];

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

function SetValuePlugin({ initialValue }: { initialValue: string }) {
  const [editor] = useLexicalComposerContext();
  const hasSetInitialValue = useRef(false);

  useEffect(() => {
    if (initialValue && !hasSetInitialValue.current) {
      const editorState = editor.parseEditorState(initialValue);
      editor.setEditorState(editorState);
      hasSetInitialValue.current = true;
    }
  }, [editor, initialValue]);

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

interface TextEditorProps {
  initialValue?: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
}

export interface TextEditorRef {
  setInitialValue: (value: string) => void;
}

const urlRegExp = new RegExp(
  /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[\w]*))?)/,
);
export function validateUrl(url: string): boolean {
  return url === "https://" || urlRegExp.test(url);
}

export const TextEditor = forwardRef<TextEditorRef, TextEditorProps>(
  ({ onChange, initialValue, isLoading }, ref) => {
    const editorConfig = useMemo(
      () => ({
        namespace: "notebooks-details",
        onError: (error: any) => {
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
        <div className="flex flex-1 relative">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className="flex-1 p-2 mt-3 outline-0! relative"
                aria-placeholder={"Enter some text..."}
                placeholder={
                  <p className="text-[#999] overflow-hidden absolute text-ellipsis top-[15px] left-[10px] text-[15px] select-none inline-block pointer-events-none">
                    {"Enter some text..."}
                  </p>
                }
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <SetValuePlugin initialValue={initialValue as string} />
        <MyOnChangePlugin onChange={onChange} />
        <SetInitialValuePlugin ref={ref} />
        <LinkPlugin validateUrl={validateUrl} />
        <AutoLinkPlugin matchers={MATCHERS} />
      </LexicalComposer>
    );
  },
);

TextEditor.displayName = "TextEditor";
