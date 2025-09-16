"use client";

import { useEffect, useRef } from "react";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { exampleSetup } from "prosemirror-example-setup";
import { schema } from "../config/schema";
import { DOMParser } from "prosemirror-model";
import MarkdownIt from "markdown-it";
import "../styles/tables.css";

const md = new MarkdownIt({ html: true });

const ProseMirrorEditor = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    // 创建初始混合 Markdown 和 HTML 文档内容
    const initialContent = `| ID | Title |
|---|------|
|#1 | Hello |
|#2 | Markdown |

# Hello World
<h1>Hello World</h1>
    `;

    // 创建一个临时 DOM 元素来解析 HTML
    const tempDiv = document.createElement("div");

    const htmlContent = md.render(initialContent);

    console.log({ htmlContent });

    tempDiv.innerHTML = htmlContent;

    // 使用 ProseMirror 的 DOMParser 解析 HTML
    const doc = DOMParser.fromSchema(schema).parse(tempDiv);

    console.log({ doc, schema });

    // 创建编辑器视图
    const view = new EditorView(editorRef.current, {
      state: EditorState.create({
        doc,
        plugins: exampleSetup({ schema }),
      }),
      dispatchTransaction(transaction) {
        // 你必须要手动更新状态 否则 用户的输入不会生效
        const newState = view.state.apply(transaction);
        view.updateState(newState);
      },
    });

    viewRef.current = view;

    // 清理函数
    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="prose-mirror-container">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-700 mb-2">富文本编辑器</h3>
      </div>

      <div ref={editorRef} className="editor-container focus:outline-none" />

      <div className="mt-4 text-xs text-gray-400">
        <p>💡 提示：这个编辑器支持直接解析 HTML 内容并提供丰富的格式化选项</p>
      </div>
    </div>
  );
};

export default ProseMirrorEditor;
