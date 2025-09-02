"use client";

import { useEffect, useRef, useState } from "react";
import { EditorState, Plugin } from "prosemirror-state";
import { EditorView, Decoration, DecorationSet } from "prosemirror-view";
import { Schema, DOMParser, Node as ProseMirrorNode } from "prosemirror-model";
import { schema } from "prosemirror-schema-basic";
import { addListNodes } from "prosemirror-schema-list";
import { exampleSetup } from "prosemirror-example-setup";

// 创建扩展的 schema，包含列表支持
const mySchema = new Schema({
  nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block"),
  marks: schema.spec.marks,
});

// 搜索高亮插件
function searchHighlightPlugin(searchTerm: string) {
  return new Plugin({
    state: {
      init() {
        if (!searchTerm.trim()) {
          return DecorationSet.empty;
        }
        return createSearchDecorations(searchTerm, null);
      },
      apply(tr, oldState) {
        // 如果没有搜索词，返回空装饰集
        if (!searchTerm.trim()) {
          return DecorationSet.empty;
        }

        // 如果文档没有变化，保持原有的装饰集
        // 但要检查是否是初始状态（空装饰集），如果是则需要创建装饰
        if (!tr.docChanged) {
          // 如果当前装饰集为空，说明是第一次搜索，需要创建装饰
          if (oldState === DecorationSet.empty) {
            return createSearchDecorations(searchTerm, tr.doc);
          }
          return oldState;
        }

        // 只有当文档结构发生变化时，才重新计算装饰集
        // 这里可以通过 map 来更新装饰位置，而不是重新计算
        try {
          return oldState.map(tr.mapping, tr.doc);
        } catch {
          // 如果 map 失败（比如装饰的内容被删除），重新创建装饰
          return createSearchDecorations(searchTerm, tr.doc);
        }
      },
    },
    props: {
      decorations(state) {
        return this.getState(state);
      },
    },
  });
}

// 创建搜索装饰的辅助函数
function createSearchDecorations(
  searchTerm: string,
  doc: ProseMirrorNode | null
) {
  if (!searchTerm.trim()) {
    return DecorationSet.empty;
  }

  console.log("重新创建搜索装饰，搜索词：", searchTerm);

  const decorations: Decoration[] = [];
  const currentDoc = doc; // 使用传入的 ProseMirror doc
  const regex = new RegExp(
    searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    "gi"
  );
  const highlightedNodes = new Set<number>(); // 记录已经高亮的节点位置

  // 遍历文档查找匹配的文本
  if (currentDoc && currentDoc.descendants) {
    currentDoc.descendants((node: ProseMirrorNode, pos: number) => {
      if (node.isText) {
        const text = node.text || "";
        if (regex.test(text)) {
          // 找到包含此文本节点的父节点
          const $pos = currentDoc.resolve(pos);
          const parentStart = $pos.start($pos.depth);
          const parentEnd = $pos.end($pos.depth);

          // 防止重复添加同一个节点的装饰
          if (!highlightedNodes.has(parentStart)) {
            highlightedNodes.add(parentStart);
            decorations.push(
              Decoration.inline(parentStart, parentEnd, {
                class: "search-highlight-node",
              })
            );
          }
        }
        // 重置正则表达式的 lastIndex
        regex.lastIndex = 0;
      }
    });

    return DecorationSet.create(currentDoc, decorations);
  }

  return DecorationSet.empty;
}

const ProseMirrorEditor = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // 更新编辑器的搜索高亮
  const updateSearch = (term: string) => {
    if (!viewRef.current) return;

    const { state } = viewRef.current;

    // 重新创建编辑器状态，用新的搜索插件替换旧的
    const basePlugins = exampleSetup({ schema: mySchema });
    const newState = EditorState.create({
      doc: state.doc,
      plugins: [...basePlugins, searchHighlightPlugin(term)],
      selection: state.selection,
    });

    viewRef.current.updateState(newState);
  };

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
      <p>开始编辑这段文本试试吧！在上面的搜索框中输入文字来测试搜索高亮功能。</p>
    `;

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = initialContent;

    // 创建编辑器视图，初始时包含搜索插件
    const view = new EditorView(editorRef.current, {
      state: EditorState.create({
        doc: DOMParser.fromSchema(mySchema).parse(tempDiv),
        plugins: [
          ...exampleSetup({ schema: mySchema }),
          searchHighlightPlugin(""),
        ],
      }),
    });

    viewRef.current = view;

    // 清理函数
    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
      }
    };
  }, []);

  // 处理搜索输入变化
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    updateSearch(term);
  };

  return (
    <div className="prose-mirror-container">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-700 mb-2">富文本编辑器</h3>

        {/* 搜索框 */}
        <div className="mb-4">
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            搜索并高亮文本
          </label>
          <input
            id="search"
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="输入要搜索的文字..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchTerm && (
            <p className="text-sm text-gray-500 mt-1">
              搜索: &quot;{searchTerm}&quot; - 匹配的文本将以黄色背景高亮显示
            </p>
          )}
        </div>
      </div>

      <div
        ref={editorRef}
        className="editor-container focus:outline-none border border-gray-300 rounded p-4 min-h-[200px]"
      />

      <div className="mt-4 text-xs text-gray-400">
        <p>
          💡
          提示：这个编辑器支持实时搜索和高亮功能，在上方搜索框中输入文字试试看
        </p>
      </div>

      {/* 添加搜索高亮样式 */}
      <style jsx>{`
        :global(.search-highlight-node) {
          background: #fef08a;
          color: #92400e;
          padding: 2px 4px;
          border-radius: 4px;
          font-weight: 500;
          border: 2px solid #f59e0b;
          margin: 1px 0;
          display: inline-block;
        }

        :global(.ProseMirror) {
          outline: none;
        }
      `}</style>
    </div>
  );
};

export default ProseMirrorEditor;
