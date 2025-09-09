"use client";

import { useEffect, useRef } from "react";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { exampleSetup } from "prosemirror-example-setup";
import { schema } from "prosemirror-markdown";
import { DOMParser } from "prosemirror-model";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt("commonmark", { html: true });

const ProseMirrorEditor = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    // 创建初始混合 Markdown 和 HTML 文档内容
    const initialContent = `
# Markdown 一级标题
## Markdown 二级标题
### Markdown 三级标题

<h1>HTML 一级标题</h1>
<h2>HTML 二级标题</h2>
<h3>HTML 三级标题</h3>

这是一个普通段落，包含 **Markdown 粗体**、*Markdown 斜体*、\`Markdown 行内代码\`。

<p>这是一个 HTML 段落，包含 <strong>HTML 粗体</strong>、<em>HTML 斜体</em>、<code>HTML 行内代码</code>、<u>HTML 下划线</u>、<s>HTML 删除线</s>。</p>

## 链接测试
这是一个 [Markdown 链接](https://example.com "Markdown 链接标题")。

<a href="https://example.com" title="HTML 链接标题">这是一个 HTML 链接</a>

## 列表测试

### Markdown 无序列表
- 列表项 1
- 列表项 2
  - 嵌套列表项 2.1
  - 嵌套列表项 2.2
- 列表项 3

### HTML 无序列表
<ul>
  <li>HTML 列表项 1</li>
  <li>HTML 列表项 2
    <ul>
      <li>HTML 嵌套列表项 2.1</li>
      <li>HTML 嵌套列表项 2.2</li>
    </ul>
  </li>
  <li>HTML 列表项 3</li>
</ul>

### Markdown 有序列表
1. 第一项
2. 第二项
3. 第三项

### HTML 有序列表
<ol>
  <li>HTML 第一项</li>
  <li>HTML 第二项</li>
  <li>HTML 第三项</li>
</ol>

## 引用块测试

> 这是一个 Markdown 引用块
> 可以包含多行内容
> > 这是嵌套引用

<blockquote>
  <p>这是一个 HTML 引用块</p>
  <p>可以包含多个段落</p>
  <blockquote>
    <p>这是 HTML 嵌套引用</p>
  </blockquote>
</blockquote>

## 代码块测试

\`\`\`javascript
// Markdown 代码块
function hello() {
  console.log("Hello, World!");
}
\`\`\`

<pre><code>// HTML 代码块
function greet(name) {
  return "Hello, " + name + "!";
}
</code></pre>

## 分割线测试

---

<hr>

## 混合格式测试
这个段落混合了 **Markdown 粗体** 和 <strong>HTML 粗体</strong>，*Markdown 斜体* 和 <em>HTML 斜体</em>，还有 <code>HTML 代码</code> 和 \`Markdown 代码\`。

<p>这个 HTML 段落包含 **Markdown 语法** 和 <strong>HTML 标签</strong> 的混合使用。</p>
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
