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
import { Button } from "@/components/ui/button";
import { Separator } from "../ui/separator";

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
      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));

      // Check if selection is within a link
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
        editorState.read(
          () => {
            $updateToolbar();
          },
          { editor },
        );
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, _newEditor) => {
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

  return (
    <div className="flex flex-wrap gap-1 h-fit" ref={toolbarRef}>
      <Button
        variant="ghost"
        size="icon"
        disabled={!canUndo}
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
        aria-label="Undo"
      >
        <Undo />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        disabled={!canRedo}
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND, undefined);
        }}
        aria-label="Redo"
      >
        <Redo />
      </Button>
      <Separator orientation="vertical" className="mx-1" />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
        }}
        className={`${isBold ? "bg-primary" : ""}`}
        aria-label="Format Bold"
      >
        <Bold />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
        }}
        className={`${isItalic ? "bg-primary" : ""}`}
        aria-label="Format Italics"
      >
        <Italic />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
        }}
        className={`${isUnderline ? "bg-primary" : ""}`}
        aria-label="Format Underline"
      >
        <Underline />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
        }}
        className={`  ${isStrikethrough ? "bg-primary" : ""}`}
        aria-label="Format Strikethrough"
      >
        <Strikethrough />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          if (isLink) {
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, null); // Remove link
          } else {
            const url = prompt("Enter the URL:");
            if (url) {
              editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
            }
          }
        }}
        className={`${isLink ? "bg-primary" : ""}`}
        aria-label={isLink ? "Remove Link" : "Insert Link"}
      >
        <Link />
      </Button>
      <Separator orientation="vertical" className="mx-1" />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
        }}
        className=" "
        aria-label="Left Align"
      >
        <AlignLeft />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
        }}
        className=" "
        aria-label="Center Align"
      >
        <AlignCenter />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
        }}
        className=" "
        aria-label="Right Align"
      >
        <AlignRight />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
        }}
        className=""
        aria-label="Justify Align"
      >
        <AlignJustify />
      </Button>
    </div>
  );
}
