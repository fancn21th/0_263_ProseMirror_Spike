"use client";

import { useEffect, useRef } from "react";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { exampleSetup } from "prosemirror-example-setup";
import { defaultMarkdownParser } from "prosemirror-markdown";

const ProseMirrorEditor = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    // 创建初始 Markdown 文档内容
    const initialContent = `# 标题`;

    // 使用 defaultMarkdownParser 解析 Markdown
    const doc = defaultMarkdownParser.parse(initialContent);
    const schema = defaultMarkdownParser.schema;

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
        <p>💡 提示：这个编辑器支持 Markdown 风格的快捷键和丰富的格式化选项</p>
      </div>
    </div>
  );
};

export default ProseMirrorEditor;
