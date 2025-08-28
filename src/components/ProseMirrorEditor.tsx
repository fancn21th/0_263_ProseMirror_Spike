"use client";

import { useEffect, useRef, useState } from "react";
import { EditorState, Plugin } from "prosemirror-state";
import { EditorView, Decoration, DecorationSet } from "prosemirror-view";
import { Schema, DOMParser } from "prosemirror-model";
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
        return DecorationSet.empty;
      },
      apply(tr) {
        if (!searchTerm.trim()) {
          return DecorationSet.empty;
        }

        const decorations: Decoration[] = [];
        const doc = tr.doc;
        const searchText = searchTerm.toLowerCase().trim();

        // 获取文档的纯文本内容和位置映射
        let fullText = "";
        const positionMap: Array<{
          textPos: number;
          docPos: number;
          nodePos: number;
          nodeEnd: number;
        }> = [];

        doc.descendants((node, pos) => {
          if (node.isText && node.text) {
            const startTextPos = fullText.length;
            fullText += node.text;

            // 为每个字符记录其在文档中的位置
            for (let i = 0; i < node.text.length; i++) {
              positionMap.push({
                textPos: startTextPos + i,
                docPos: pos + i,
                nodePos: pos,
                nodeEnd: pos + node.text.length,
              });
            }
          }
        });

        // 在完整文本中搜索
        const lowerFullText = fullText.toLowerCase();
        let searchIndex = 0;

        while (
          (searchIndex = lowerFullText.indexOf(searchText, searchIndex)) !== -1
        ) {
          const matchStart = searchIndex;
          const matchEnd = searchIndex + searchText.length - 1;

          if (
            matchStart < positionMap.length &&
            matchEnd < positionMap.length
          ) {
            // 找到匹配范围涉及的所有节点
            const affectedNodes = new Set<string>();

            // 收集所有涉及的节点
            for (let i = matchStart; i <= matchEnd; i++) {
              if (i < positionMap.length) {
                const mapping = positionMap[i];
                const nodeKey = `${mapping.nodePos}-${mapping.nodeEnd}`;
                affectedNodes.add(nodeKey);
              }
            }

            // 为每个受影响的节点创建高亮装饰
            affectedNodes.forEach((nodeKey) => {
              const [nodeStart] = nodeKey.split("-").map(Number);
              // 找到节点的父级范围进行高亮
              const $pos = doc.resolve(nodeStart);
              const parentStart = $pos.start($pos.depth);
              const parentEnd = $pos.end($pos.depth);

              decorations.push(
                Decoration.inline(parentStart, parentEnd, {
                  class: "search-highlight-node",
                })
              );
            });
          }

          searchIndex++;
        }

        return DecorationSet.create(doc, decorations);
      },
    },
    props: {
      decorations(state) {
        return this.getState(state);
      },
    },
  });
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
      <p>测试跨节点搜索：<strong>跨越</strong>多个<em>节点</em>的文本搜索。</p>
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
            <div className="text-sm text-gray-500 mt-1 space-y-1">
              <p>
                搜索: &quot;{searchTerm}&quot; - 匹配的节点将以黄色背景高亮显示
              </p>
              <p className="text-xs">
                💡 支持跨节点搜索，试试搜索 &quot;跨越多个节点&quot;
              </p>
            </div>
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
