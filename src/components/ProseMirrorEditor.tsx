"use client";

import { useEffect, useRef } from "react";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Node as ProseMirrorNode, Mark } from "prosemirror-model";
import { exampleSetup } from "prosemirror-example-setup";
import { defaultMarkdownParser } from "prosemirror-markdown";
import TreeNodes from "./TreeNodes";
import content from "./md.txt";

const ProseMirrorEditor = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  // 递归打印节点信息
  const printNodes = (node: ProseMirrorNode, depth = 0) => {
    const indent = "  ".repeat(depth);
    console.log(`${indent}节点类型: ${node.type.name}`);

    if (node.attrs && Object.keys(node.attrs).length > 0) {
      console.log(`${indent}属性:`, node.attrs);
    }

    if (node.marks && node.marks.length > 0) {
      console.log(
        `${indent}标记:`,
        node.marks.map((mark: Mark) => mark.type.name)
      );
    }

    if (node.isText && "text" in node) {
      console.log(`${indent}文本内容: "${node.text}"`);
    }

    if (node.content) {
      console.log(`${indent}子节点数量: ${node.content.size}`);
      node.content.forEach((child: ProseMirrorNode, index: number) => {
        console.log(`${indent}子节点 ${index}:`);
        printNodes(child, depth + 1);
      });
    }
  };

  // 打印当前文档的所有节点
  const printCurrentNodes = () => {
    if (viewRef.current) {
      console.log("==================== 当前文档节点结构 ====================");
      const doc = viewRef.current.state.doc;
      printNodes(doc);
      console.log("==================== 节点结构结束 ====================");
    }
  };

  useEffect(() => {
    if (!editorRef.current) return;

    // 使用 defaultMarkdownParser 解析 Markdown
    const doc = defaultMarkdownParser.parse(content);
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
    <div className="flex p-4 border rounded shadow-sm bg-white gap-4">
      {/* 编辑器在左侧 */}
      <div className="flex-1">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-700">富文本编辑器</h3>
          <button
            onClick={printCurrentNodes}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            打印节点结构
          </button>
        </div>
        <div
          ref={editorRef}
          className="editor-container focus:outline-none h-[400px]"
        />
        <div className="mt-4 text-xs text-gray-400">
          <p>💡 提示：这个编辑器支持 Markdown 风格的快捷键和丰富的格式化选项</p>
          <p>🔍 点击上方按钮可以在控制台查看当前文档的节点结构</p>
        </div>
      </div>
      {/* 图形渲染在右侧 */}
      <div className="flex-1">
        <TreeNodes />
      </div>
    </div>
  );
};

export default ProseMirrorEditor;
