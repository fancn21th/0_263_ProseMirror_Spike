"use client";

import { useEffect, useRef, useState } from "react";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Node as ProseMirrorNode, Mark } from "prosemirror-model";
import { exampleSetup } from "prosemirror-example-setup";
import { defaultMarkdownParser } from "prosemirror-markdown";
import TreeNodes from "./TreeNodes";

// 定义树节点的数据结构
export interface TreeNodeData {
  id: string;
  nodeType: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: string[];
  position?: number;
  nodeSize?: number;
  children?: TreeNodeData[];
}

const ProseMirrorEditor = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [treeData, setTreeData] = useState<TreeNodeData | null>(null);

  // 递归打印节点信息
  const printNodes = (node: ProseMirrorNode, depth = 0, pos = 0) => {
    const indent = "  ".repeat(depth);
    console.log(`${indent}节点类型: ${node.type.name}`);
    console.log(
      `${indent}位置: pos-${pos}, 节点大小: nodeSize-${node.nodeSize}`
    );

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
      console.log(`${indent}子节点数量: count-${node.content.size}`);
      let childPos = pos + 1; // 子节点开始位置
      node.content.forEach((child: ProseMirrorNode, index: number) => {
        console.log(`${indent}子节点 index-${index}:`);
        printNodes(child, depth + 1, childPos);
        childPos += child.nodeSize;
      });
    }
  };

  // 打印当前文档的所有节点
  const printCurrentNodes = () => {
    if (viewRef.current) {
      console.log("==================== 当前文档节点结构 ====================");
      const doc = viewRef.current.state.doc;
      printNodes(doc, 0, 0); // 从位置0开始
      console.log("==================== 节点结构结束 ====================");
    }
  };

  useEffect(() => {
    if (!editorRef.current) return;

    /**

    位置:  0  1  2  3  4  5  6  7  8  ...
    内容: [doc[heading[标题]paragraph[这是...]]...]
          ^   ^      ^   ^
          |   |      |   heading结束(pos 4)
          |   |      文本"标题"(pos 2-3)
          |   heading开始(pos 1)
          doc开始(pos 0)

     */

    // 将 ProseMirror 节点转换为树形数据结构
    const convertNodeToTreeData = (
      node: ProseMirrorNode,
      path = "0",
      pos = 0
    ): TreeNodeData => {
      const nodeData: TreeNodeData = {
        id: `${path}-${node.type.name}`,
        nodeType: node.type.name,
        position: pos,
        nodeSize: node.nodeSize,
      };

      // 添加文本内容
      if (node.isText && "text" in node && node.text) {
        nodeData.text = node.text;
      }

      // 添加属性
      if (node.attrs && Object.keys(node.attrs).length > 0) {
        nodeData.attrs = node.attrs;
      }

      // 添加标记
      if (node.marks && node.marks.length > 0) {
        nodeData.marks = node.marks.map((mark: Mark) => mark.type.name);
      }

      // 添加子节点
      if (node.content && node.content.size > 0) {
        nodeData.children = [];
        let childPos = pos + 1; // 子节点开始位置（跳过开始标记）

        node.content.forEach((child: ProseMirrorNode, index: number) => {
          nodeData.children!.push(
            convertNodeToTreeData(child, `${path}-child-${index}`, childPos)
          );
          childPos += child.nodeSize; // 移动到下一个子节点的位置
        });
      }

      return nodeData;
    };

    // 更新树形数据的函数
    const updateTreeData = () => {
      if (viewRef.current) {
        const doc = viewRef.current.state.doc;
        // 文档的根节点位置从0开始
        const newTreeData = convertNodeToTreeData(doc, "root", 0);
        setTreeData(newTreeData);
      }
    };

    // 创建初始 Markdown 文档内容
    const initialContent = `# 标题

这是一个示例文档，包含：

- 列表项 1
- 列表项 2

**粗体文本** 和 *斜体文本*

> 这是一个引用块

\`\`\`javascript
console.log("代码块");
\`\`\`
`;

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
        // 每次编辑器状态更新时，更新树形数据
        updateTreeData();
      },
    });

    viewRef.current = view;

    // 初始化树形数据
    updateTreeData();

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
        <h3 className="text-lg font-medium text-gray-700 mb-4">节点结构树</h3>
        {treeData ? (
          <TreeNodes data={treeData} />
        ) : (
          <div className="text-gray-400">加载中...</div>
        )}
      </div>
    </div>
  );
};

export default ProseMirrorEditor;
