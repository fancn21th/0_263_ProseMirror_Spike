"use client";

import { useEffect, useRef, useState } from "react";
import { EditorState, Transaction } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { exampleSetup } from "prosemirror-example-setup";
import { defaultMarkdownParser } from "prosemirror-markdown";
import { Schema, DOMParser, Node } from "prosemirror-model";

// 流式内容类型定义 - 模拟后端返回的 chunk 结构
type StreamChunk =
  | { type: "text"; content: string }
  | { type: "dino"; content: { dinoType: string } };

// The supported types of dinosaurs.
const dinos = [
  "brontosaurus",
  "stegosaurus",
  "triceratops",
  "tyrannosaurus",
  "pterodactyl",
];

const dinoNodeSpec = {
  // Dinosaurs have one attribute, their type, which must be one of
  // the types defined above.
  // Brontosaurs are still the default dino.
  attrs: { type: { default: "brontosaurus" } },
  inline: true,
  group: "inline",
  draggable: true,

  // These nodes are rendered as images with a `dino-type` attribute.
  // There are pictures for all dino types under /img/dino/.
  toDOM: (node: Node) =>
    [
      "img",
      {
        "dino-type": node.attrs.type,
        src: "/img/dino/" + node.attrs.type + ".png",
        title: node.attrs.type,
        class: "dinosaur",
        style:
          "width: 40px; height: 40px; vertical-align: middle; margin: 0 2px;",
      },
    ] as const,
  // When parsing, such an image, if its type matches one of the known
  // types, is converted to a dino node.
  parseDOM: [
    {
      tag: "img[dino-type]",
      getAttrs: (dom: HTMLElement) => {
        const type = dom.getAttribute("dino-type");
        return dinos.indexOf(type || "") > -1 ? { type } : false;
      },
    },
  ],
};

const ProseMirrorEditor = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  // 模拟后端返回的 chunk 流式数据（文本 + 恐龙节点）
  const streamContent: StreamChunk[] = [
    { type: "text", content: "这是一段流式输入的模拟文本，包含了文字和恐龙 " },
    { type: "dino", content: { dinoType: "triceratops" } },
    { type: "text", content: " 很棒吧！继续添加更多内容，比如另一只恐龙 " },
    { type: "dino", content: { dinoType: "brontosaurus" } },
    { type: "text", content: " 和最后一只 " },
    { type: "dino", content: { dinoType: "tyrannosaurus" } },
    {
      type: "text",
      content: "。这种混合内容的流式输入展示了ProseMirror的强大功能！",
    },
  ];

  // 流式输入状态
  const streamingRef = useRef<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);

  // 将 chunk 拆分成单个字符的函数 - 模拟真实的流式数据处理
  const expandChunksToCharacters = (chunks: StreamChunk[]): StreamChunk[] => {
    const expandedChunks: StreamChunk[] = [];

    for (const chunk of chunks) {
      if (chunk.type === "text") {
        // 将文本 chunk 拆分成单个字符的 chunk
        for (const char of chunk.content) {
          expandedChunks.push({ type: "text", content: char });
        }
      } else {
        // 非文本 chunk（如恐龙节点）保持不变
        expandedChunks.push(chunk);
      }
    }

    return expandedChunks;
  };

  useEffect(() => {
    if (!editorRef.current) return;

    // 创建包含恐龙节点的 schema
    const schema = new Schema({
      nodes: defaultMarkdownParser.schema.spec.nodes.addBefore(
        "image",
        "dinosaur",
        dinoNodeSpec
      ),
      marks: defaultMarkdownParser.schema.spec.marks,
    });

    // 创建包含恐龙的 HTML 内容
    const htmlContent = `
      <h1>标题</h1>
      <p>这是一个包含恐龙的段落 <img dino-type="triceratops" src="/img/dino/triceratops.png" title="triceratops" class="dinosaur"> 很棒吧！</p>
      <p>再来一个恐龙：<img dino-type="brontosaurus" src="/img/dino/brontosaurus.png" title="brontosaurus" class="dinosaur"></p>
    `;

    // 创建一个临时的 DOM 元素来解析 HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlContent;

    // 使用 DOMParser 解析 HTML 内容
    const doc = DOMParser.fromSchema(schema).parse(tempDiv);

    console.log({ doc, schema });

    // 创建编辑器视图
    const view = new EditorView(editorRef.current, {
      state: EditorState.create({
        doc,
        plugins: exampleSetup({ schema }),
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

  // 创建 ProseMirror Command 风格的插入恐龙函数
  const createInsertDinoCommand = (type: string) => {
    return (state: EditorState, dispatch?: (tr: Transaction) => void) => {
      const { schema, selection } = state;
      const { $from } = selection;
      const index = $from.index();

      // 检查是否可以在当前位置插入恐龙节点
      if (!$from.parent.canReplaceWith(index, index, schema.nodes.dinosaur)) {
        return false;
      }

      // 如果有 dispatch，执行插入操作
      if (dispatch) {
        const dinoNode = schema.nodes.dinosaur.create({ type });
        const transaction = state.tr.replaceSelectionWith(dinoNode);
        dispatch(transaction);
      }

      return true;
    };
  };

  // UI 层面的插入恐龙函数
  const insertDino = (type: string) => {
    if (!viewRef.current) return;

    const { state, dispatch } = viewRef.current;
    const command = createInsertDinoCommand(type);

    // 执行命令并检查结果
    const success = command(state, dispatch);
    if (!success) {
      console.warn(`无法在当前位置插入 ${type} 恐龙`);
    }
  };

  // 流式输入模拟函数
  const simulateStreamingInput = async () => {
    if (!viewRef.current || streamingRef.current) return;

    streamingRef.current = true;
    setIsStreaming(true);
    const view = viewRef.current;

    // 将 streamContent 拆分成单字符 chunk - 模拟真实的流式数据处理
    const expandedChunks = expandChunksToCharacters(streamContent);

    // 遍历拆分后的 chunk 流式数据
    for (const chunk of expandedChunks) {
      if (!streamingRef.current) break; // 允许中断流式输入

      if (chunk.type === "text") {
        // 插入单个字符（现在每个文本 chunk 只包含一个字符）
        // 每次都获取最新的 state 和光标位置
        const { state } = view;
        const insertPos = state.selection.to; // 使用 selection.to 获取当前光标位置

        // 创建事务在当前光标位置插入字符
        const tr = state.tr.insertText(chunk.content, insertPos);
        view.dispatch(tr);

        // 模拟打字延迟（30-100ms之间的随机延迟）
        const delay = Math.random() * 70 + 30;
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else if (chunk.type === "dino") {
        // 从 chunk.content 中提取恐龙类型并插入恐龙节点
        // 每次都获取最新的 state 和光标位置
        const { state } = view;
        const { schema } = state;
        const insertPos = state.selection.to; // 使用 selection.to 获取当前光标位置

        // 创建恐龙节点
        const dinoNode = schema.nodes.dinosaur.create({
          type: chunk.content.dinoType,
        });

        // 在当前光标位置插入恐龙节点
        const tr = state.tr.insert(insertPos, dinoNode);
        view.dispatch(tr);

        // 恐龙插入后稍微长一点的延迟
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }

    streamingRef.current = false;
    setIsStreaming(false);
  };

  // 停止流式输入
  const stopStreaming = () => {
    streamingRef.current = false;
    setIsStreaming(false);
  };

  return (
    <div className="prose-mirror-container">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-700 mb-2">富文本编辑器</h3>

        {/* 恐龙插入按钮 */}
        <div className="flex gap-2 mb-4">
          {dinos.map((dino) => (
            <button
              key={dino}
              onClick={() => insertDino(dino)}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              插入 {dino}
            </button>
          ))}
        </div>

        {/* 流式输入控制按钮 */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={simulateStreamingInput}
            disabled={isStreaming}
            className="px-4 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isStreaming ? "正在流式输入..." : "开始流式输入"}
          </button>
          <button
            onClick={stopStreaming}
            disabled={!isStreaming}
            className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            停止输入
          </button>
        </div>
      </div>

      <div
        ref={editorRef}
        className="editor-container focus:outline-none border border-gray-300 rounded p-4 min-h-[200px]"
      />

      <div className="mt-4 text-xs text-gray-400">
        <p>
          💡 提示：这个编辑器支持自定义恐龙节点，点击上方按钮插入不同类型的恐龙
        </p>
        <p>
          🚀 流式输入：点击&ldquo;开始流式输入&rdquo;按钮可以模拟AI逐 chunk
          生成内容的效果，每个 chunk 包含文字或恐龙节点数据
        </p>
      </div>
    </div>
  );
};

export default ProseMirrorEditor;
