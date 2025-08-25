"use client";

import { useEffect, useRef } from "react";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Schema, DOMParser } from "prosemirror-model";
import { schema } from "prosemirror-schema-basic";
import { addListNodes } from "prosemirror-schema-list";
import { exampleSetup } from "prosemirror-example-setup";

// 创建扩展的 schema，包含列表支持
const mySchema = new Schema({
  nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block"),
  marks: schema.spec.marks,
});

const ProseMirrorEditor = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    // 创建初始文档内容，包含一些示例文本
    const initialContent = `
      <h2>欢迎使用 ProseMirror 编辑器</h2>
      <p>这是一个功能完整的富文本编辑器演示。你可以：</p>
      <ul>
        <li>使用 <strong>Ctrl+B</strong> 创建<strong>粗体文本</strong></li>
        <li>使用 <strong>Ctrl+I</strong> 创建<em>斜体文本</em></li>
        <li>使用 <strong>Ctrl+Z</strong> 撤销操作</li>
        <li>使用 <strong>Ctrl+Y</strong> 重做操作</li>
      </ul>
      <p>开始编辑这段文本试试吧！</p>
    `;

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = initialContent;

    const doc = DOMParser.fromSchema(mySchema).parse(tempDiv);

    // 创建编辑器状态
    const state = EditorState.create({
      doc,
      plugins: exampleSetup({ schema: mySchema, menuBar: false }),
    });

    // 创建编辑器视图
    const view = new EditorView(editorRef.current, {
      state,
      dispatchTransaction(transaction) {
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
        <p>💡 提示：这个编辑器支持 Markdown 风格的快捷键和丰富的格式化选项</p>
      </div>
    </div>
  );
};

export default ProseMirrorEditor;
