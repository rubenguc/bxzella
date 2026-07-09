import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection } from "lexical";
import { mergeRegister } from "@lexical/utils";
import {
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Link,
  Redo,
  Strikethrough,
  Underline,
  Undo,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "#/components/ui/button";
import { Separator } from "#/components/ui/separator";

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isLink, setIsLink] = useState(false);

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));

      const anchorNode = selection.anchor.getNode();
      const focusNode = selection.focus.getNode();
      const anchorParent = anchorNode.getParent();
      const focusParent = focusNode.getParent();
      setIsLink($isLinkNode(anchorParent) || $isLinkNode(focusParent));
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => $updateToolbar(), { editor });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $updateToolbar();
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
    );
  }, [editor, $updateToolbar]);

  const linkClickHandler = () => {
    if (isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    } else {
      const url = window.prompt("Enter the URL:");
      if (url) editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
    }
  };

  return (
    <div className="flex overflow-x-auto gap-1 h-fit pb-2" ref={toolbarRef}>
      <Button variant="ghost" size="icon" disabled={!canUndo} onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)} aria-label="Undo">
        <Undo className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" disabled={!canRedo} onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)} aria-label="Redo">
        <Redo className="h-4 w-4" />
      </Button>
      <Separator orientation="vertical" className="mx-1 h-6 self-center" />
      <Button variant="ghost" size="icon" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")} className={isBold ? "bg-accent" : ""} aria-label="Bold">
        <Bold className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")} className={isItalic ? "bg-accent" : ""} aria-label="Italic">
        <Italic className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline")} className={isUnderline ? "bg-accent" : ""} aria-label="Underline">
        <Underline className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")} className={isStrikethrough ? "bg-accent" : ""} aria-label="Strikethrough">
        <Strikethrough className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={linkClickHandler} className={isLink ? "bg-accent" : ""} aria-label={isLink ? "Remove Link" : "Insert Link"}>
        <Link className="h-4 w-4" />
      </Button>
      <Separator orientation="vertical" className="mx-1 h-6 self-center" />
      <Button variant="ghost" size="icon" onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")} aria-label="Align Left">
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")} aria-label="Align Center">
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")} aria-label="Align Right">
        <AlignRight className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify")} aria-label="Justify">
        <AlignJustify className="h-4 w-4" />
      </Button>
    </div>
  );
}
