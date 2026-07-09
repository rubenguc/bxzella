/**
 * Recursively extracts plain text from a Lexical editor state JSON string.
 *
 * Lexical stores text in nodes with `type: "text"` and a `text` property.
 * Paragraphs and line breaks are converted to newlines.
 * Works client-side and server-side — no Lexical runtime dependency.
 */

interface LexicalNode {
  type?: string;
  text?: string;
  children?: LexicalNode[];
  [key: string]: unknown;
}

interface LexicalState {
  root: LexicalNode;
}

function collectText(node: LexicalNode, parts: string[]): void {
  if (!node) return;

  if (node.type === "text" && typeof node.text === "string") {
    parts.push(node.text);
  }

  if (node.type === "linebreak") {
    parts.push("\n");
  }

  // Paragraph ends = newline (except for the last one)
  if (
    (node.type === "paragraph" || node.type === "heading" || node.type === "quote") &&
    parts.length > 0 &&
    parts[parts.length - 1] !== "\n"
  ) {
    parts.push("\n");
  }

  if (node.children) {
    for (const child of node.children) {
      collectText(child, parts);
    }
  }
}

export function lexicalToPlainText(editorStateJSON: string): string {
  if (!editorStateJSON) return "";

  try {
    const state: LexicalState = JSON.parse(editorStateJSON);
    if (!state.root) return "";

    const parts: string[] = [];
    for (const child of state.root.children || []) {
      collectText(child, parts);
    }

    return parts.join("").trim();
  } catch {
    // If it's not valid JSON or not Lexical format, return as-is
    return editorStateJSON;
  }
}
