"use client";

import React, { useEffect, useRef, useState } from "react";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Schema, DOMParser } from "prosemirror-model";
import { keymap } from "prosemirror-keymap";
import { baseKeymap } from "prosemirror-commands";
import { toggleMark } from "prosemirror-commands";
import { findWrapping } from "prosemirror-transform";

// 1. 最简单的文本 Schema
const textSchema = new Schema({
  nodes: {
    text: {},
    doc: { content: "text*" },
  },
});

// 2. 笔记和笔记组 Schema
const noteSchema = new Schema({
  nodes: {
    text: {},
    note: {
      content: "text*",
      toDOM() {
        return ["div", { class: "note" }, 0];
      },
      parseDOM: [{ tag: "div.note" }],
    },
    notegroup: {
      content: "note+",
      toDOM() {
        return ["div", { class: "notegroup" }, 0];
      },
      parseDOM: [{ tag: "div.notegroup" }],
    },
    doc: {
      content: "(note | notegroup)+",
    },
  },
});

// 3. 星号和标记 Schema
const starSchema = new Schema({
  nodes: {
    text: {
      group: "inline",
    },
    star: {
      inline: true,
      group: "inline",
      toDOM() {
        return ["span", { class: "star" }, "🟊"];
      },
      parseDOM: [{ tag: "span.star" }],
    },
    paragraph: {
      group: "block",
      content: "inline*",
      toDOM() {
        return ["p", 0];
      },
      parseDOM: [{ tag: "p" }],
    },
    boring_paragraph: {
      group: "block",
      content: "text*",
      marks: "",
      toDOM() {
        return ["p", { class: "boring" }, 0];
      },
      parseDOM: [{ tag: "p.boring", priority: 60 }],
    },
    doc: {
      content: "block+",
    },
  },
  marks: {
    shouting: {
      toDOM() {
        return ["span", { class: "shouting" }, 0];
      },
      parseDOM: [{ tag: "span.shouting" }],
    },
    link: {
      attrs: { href: {} },
      toDOM(node) {
        return ["a", { href: node.attrs.href }, 0];
      },
      parseDOM: [
        {
          tag: "a",
          getAttrs(dom: HTMLElement) {
            return { href: dom.getAttribute("href") };
          },
        },
      ],
      inclusive: false,
    },
  },
});

// 自定义命令
function makeNoteGroup(state: EditorState, dispatch?: (tr: any) => void) {
  const range = state.selection.$from.blockRange(state.selection.$to);
  if (!range) return false;
  const wrapping = findWrapping(range, noteSchema.nodes.notegroup);
  if (!wrapping) return false;
  if (dispatch) dispatch(state.tr.wrap(range, wrapping).scrollIntoView());
  return true;
}

function toggleLink(state: EditorState, dispatch?: (tr: any) => void) {
  const { doc, selection } = state;
  if (selection.empty) return false;
  let attrs = null;
  if (!doc.rangeHasMark(selection.from, selection.to, starSchema.marks.link)) {
    const href = prompt("Link to where?", "");
    if (!href) return false;
    attrs = { href };
  }
  return toggleMark(starSchema.marks.link, attrs)(state, dispatch);
}

function insertStar(state: EditorState, dispatch?: (tr: any) => void) {
  const type = starSchema.nodes.star;
  const { $from } = state.selection;
  if (!$from.parent.canReplaceWith($from.index(), $from.index(), type))
    return false;
  if (dispatch) dispatch(state.tr.replaceSelectionWith(type.create()));
  return true;
}

const ProseMirrorPage: React.FC = () => {
  const textEditorRef = useRef<HTMLDivElement>(null);
  const noteEditorRef = useRef<HTMLDivElement>(null);
  const starEditorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState<"text" | "notes" | "stars">(
    "text"
  );

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // 1. 文本编辑器
    if (textEditorRef.current) {
      // 方法1: 直接使用节点构造函数（原来的方法）
      // const textState = EditorState.create({
      //   doc: textSchema.node("doc", null, textSchema.text("Edit me!")),
      //   plugins: [keymap(baseKeymap)],
      // });

      // 方法2: 使用字符串通过 DOMParser 解析
      const htmlString =
        "<div>Hello from string! You can edit this text.</div>";
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = htmlString;

      // 使用 DOMParser 将 HTML 转换为 ProseMirror 文档
      const parsedDoc = DOMParser.fromSchema(textSchema).parse(tempDiv);

      const textState = EditorState.create({
        doc: parsedDoc,
        plugins: [keymap(baseKeymap)],
      });

      new EditorView(textEditorRef.current, {
        state: textState,
      });
    }

    // 2. 笔记编辑器
    if (noteEditorRef.current) {
      const noteKeymap = keymap({
        "Mod-Space": makeNoteGroup, // Mod 在 Mac 上是 Cmd，在 Windows/Linux 上是 Ctrl
        ...baseKeymap,
      });

      // 方法1: 直接使用节点构造函数（原来的方法）
      // const noteState = EditorState.create({
      //   doc: noteSchema.node("doc", null, [
      //     noteSchema.node("note", null, noteSchema.text("First note")),
      //     noteSchema.node("note", null, noteSchema.text("Second note")),
      //   ]),
      //   plugins: [noteKeymap],
      // });

      // 方法2: 使用 HTML 字符串解析
      const htmlString = `
        <div>
          <div class="note">First note from string</div>
          <div class="note">Second note from string</div>
          <div class="notegroup">
            <div class="note">Grouped note 1</div>
            <div class="note">Grouped note 2</div>
          </div>
        </div>
      `;

      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = htmlString;
      const parsedNoteDoc = DOMParser.fromSchema(noteSchema).parse(tempDiv);

      const noteState = EditorState.create({
        doc: parsedNoteDoc,
        plugins: [noteKeymap],
      });

      new EditorView(noteEditorRef.current, {
        state: noteState,
      });
    }

    // 3. 星号编辑器
    if (starEditorRef.current) {
      const starKeymap = keymap({
        "Mod-b": toggleMark(starSchema.marks.shouting), // Cmd+B 在 Mac 上
        "Mod-q": toggleLink, // Cmd+Q 在 Mac 上
        "Mod-Space": insertStar, // Cmd+Space 在 Mac 上
        ...baseKeymap,
      });

      const starState = EditorState.create({
        doc: starSchema.node("doc", null, [
          starSchema.node("paragraph", null, [
            starSchema.text("Such as this sentence."),
          ]),
          starSchema.node("paragraph", null, [starSchema.text("Do laundry")]),
          starSchema.node("paragraph", null, [
            starSchema.text("Water the tomatoes"),
          ]),
          starSchema.node("paragraph", null, [
            starSchema.text(
              "This is a nice paragraph, it can have anything in it."
            ),
          ]),
          starSchema.node("boring_paragraph", null, [
            starSchema.text(
              "This paragraph is boring, it can't have anything."
            ),
          ]),
        ]),
        plugins: [starKeymap],
      });

      new EditorView(starEditorRef.current, {
        state: starState,
      });
    }
  }, [isClient, activeTab]);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading ProseMirror examples...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-gray-900">
            ProseMirror Schemas from Scratch
          </h1>
          <p className="text-gray-600 mt-2">
            Examples based on the official ProseMirror documentation
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
          <button
            onClick={() => setActiveTab("text")}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === "text"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Text Schema
          </button>
          <button
            onClick={() => setActiveTab("notes")}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === "notes"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Notes Schema
          </button>
          <button
            onClick={() => setActiveTab("stars")}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === "stars"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Stars & Marks Schema
          </button>
        </div>

        {/* Text Schema Example */}
        {activeTab === "text" && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Simple Text Schema</h2>
            <p className="text-gray-600 mb-4">
              The most simple schema possible allows the document to be composed
              just of text. This example shows how to initialize a document from
              an HTML string.
            </p>

            <div className="border rounded-lg p-4 mb-4">
              <div
                ref={textEditorRef}
                className="prose max-w-none min-h-[100px]"
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">两种初始化方法:</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm mb-1">
                    方法1: 直接构造节点对象
                  </h4>
                  <pre className="text-xs text-gray-800 overflow-x-auto bg-white p-2 rounded">
                    {`const doc = textSchema.node("doc", null,
  textSchema.text("Edit me!")
)`}
                  </pre>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1">
                    方法2: 解析 HTML 字符串 (当前使用)
                  </h4>
                  <pre className="text-xs text-gray-800 overflow-x-auto bg-white p-2 rounded">
                    {`const htmlString = "<div>Hello from string!</div>";
const tempDiv = document.createElement("div");
tempDiv.innerHTML = htmlString;
const doc = DOMParser.fromSchema(schema).parse(tempDiv);`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notes Schema Example */}
        {activeTab === "notes" && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              Notes and Groups Schema
            </h2>
            <p className="text-gray-600 mb-4">
              This schema consists of notes that can optionally be grouped with
              group nodes. This example demonstrates parsing HTML strings with
              custom node types. Press{" "}
              <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">
                Cmd+Space
              </kbd>{" "}
              to group selected notes.
            </p>

            <div className="border rounded-lg p-4 mb-4">
              <div
                ref={noteEditorRef}
                className="prose max-w-none min-h-[200px]"
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">从 HTML 字符串初始化:</h3>
              <pre className="text-xs text-gray-800 overflow-x-auto bg-white p-2 rounded mb-2">
                {`const htmlString = \`
  <div>
    <div class="note">First note from string</div>
    <div class="note">Second note from string</div>
    <div class="notegroup">
      <div class="note">Grouped note 1</div>
      <div class="note">Grouped note 2</div>
    </div>
  </div>
\`;
const doc = DOMParser.fromSchema(noteSchema).parse(tempDiv);`}
              </pre>
              <h3 className="font-semibold mb-2 mt-4">Features:</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Individual notes with custom DOM representation</li>
                <li>• Note groups that contain multiple notes</li>
                <li>• Custom command to wrap notes in groups (Cmd+Space)</li>
                <li>• Enter/Backspace work to create and manage notes</li>
              </ul>
            </div>
          </div>
        )}

        {/* Stars Schema Example */}
        {activeTab === "stars" && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              Stars and Marks Schema
            </h2>
            <p className="text-gray-600 mb-4">
              This schema includes inline nodes (stars) and marks (shouting and
              links).
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-blue-800 mb-2">
                Keyboard shortcuts:
              </h3>
              <div className="text-sm text-blue-700 space-y-1">
                <div>
                  <kbd className="px-2 py-1 bg-white rounded text-xs">
                    Cmd+Space
                  </kbd>{" "}
                  - Insert a star
                </div>
                <div>
                  <kbd className="px-2 py-1 bg-white rounded text-xs">
                    Cmd+B
                  </kbd>{" "}
                  - Toggle shouting
                </div>
                <div>
                  <kbd className="px-2 py-1 bg-white rounded text-xs">
                    Cmd+Q
                  </kbd>{" "}
                  - Add/remove link
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 mb-4">
              <div
                ref={starEditorRef}
                className="prose max-w-none min-h-[300px]"
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Schema Features:</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>
                  • <strong>Inline nodes:</strong> Stars that can be inserted
                  anywhere
                </li>
                <li>
                  • <strong>Regular paragraphs:</strong> Allow any inline
                  content and marks
                </li>
                <li>
                  • <strong>Boring paragraphs:</strong> Only allow plain text
                  (no marks)
                </li>
                <li>
                  • <strong>Shouting mark:</strong> Makes text uppercase and
                  bold
                </li>
                <li>
                  • <strong>Link mark:</strong> Creates clickable links with
                  href attributes
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        .ProseMirror {
          outline: none;
          min-height: 100px;
          padding: 12px;
          border-radius: 6px;
        }

        .note {
          background: #f0f9ff;
          border: 1px solid #0ea5e9;
          border-radius: 4px;
          padding: 8px 12px;
          margin: 4px 0;
          display: block;
        }

        .notegroup {
          background: #fef3c7;
          border: 2px solid #f59e0b;
          border-radius: 6px;
          padding: 12px;
          margin: 8px 0;
        }

        .notegroup .note {
          background: white;
          border-color: #0ea5e9;
        }

        .star {
          color: #f59e0b;
          font-size: 1.2em;
          margin: 0 2px;
        }

        .shouting {
          font-weight: bold;
          text-transform: uppercase;
          color: #dc2626;
          background: #fef2f2;
          padding: 2px 4px;
          border-radius: 3px;
        }

        .boring {
          color: #6b7280;
          font-style: italic;
          background: #f9fafb;
          border-left: 4px solid #d1d5db;
          padding-left: 12px;
        }

        a {
          color: #2563eb;
          text-decoration: underline;
        }

        a:hover {
          text-decoration: none;
        }
      `}</style>
    </div>
  );
};

export default ProseMirrorPage;
