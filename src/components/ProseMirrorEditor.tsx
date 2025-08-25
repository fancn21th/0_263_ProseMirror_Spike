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

    // 创建初始文档内容
    const doc = DOMParser.fromSchema(mySchema).parse(
      document.createElement("div")
    );

    // 创建编辑器状态
    const state = EditorState.create({
      doc,
      plugins: exampleSetup({ schema: mySchema }),
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
        <h3 className="text-lg font-medium text-gray-700 mb-2">编辑器工具栏</h3>
        <p className="text-sm text-gray-500">
          使用快捷键：Ctrl+B (粗体), Ctrl+I (斜体), Ctrl+Z (撤销), Ctrl+Y (重做)
        </p>
      </div>

      <div
        ref={editorRef}
        className="editor-container focus:outline-none"
        style={{ minHeight: "300px" }}
      />

      <div className="mt-4 text-xs text-gray-400">
        <p>这是一个基于 ProseMirror 的富文本编辑器演示</p>
      </div>
    </div>
  );
};

export default ProseMirrorEditor;
