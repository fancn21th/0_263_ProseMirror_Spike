"use client";

import { useEffect, useRef } from "react";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { exampleSetup } from "prosemirror-example-setup";
import { defaultMarkdownParser } from "prosemirror-markdown";
import { Schema, DOMParser, Node } from "prosemirror-model";

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

  // 添加一个插入恐龙的辅助函数
  const insertDino = (type: string) => {
    if (!viewRef.current) return;

    const { state, dispatch } = viewRef.current;
    const { schema } = state;
    const dinoNode = schema.nodes.dinosaur.create({ type });

    const transaction = state.tr.replaceSelectionWith(dinoNode);
    dispatch(transaction);
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
      </div>

      <div
        ref={editorRef}
        className="editor-container focus:outline-none border border-gray-300 rounded p-4 min-h-[200px]"
      />

      <div className="mt-4 text-xs text-gray-400">
        <p>
          💡 提示：这个编辑器支持自定义恐龙节点，点击上方按钮插入不同类型的恐龙
        </p>
      </div>
    </div>
  );
};

export default ProseMirrorEditor;
