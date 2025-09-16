import { Node as ProseMirrorNode } from "prosemirror-model";
import { EditorView, NodeView } from "prosemirror-view";
import { NodeSelection } from "prosemirror-state";

export class TableNodeView implements NodeView {
  dom: HTMLElement;
  contentDOM: HTMLElement;
  node: ProseMirrorNode;
  view: EditorView;
  getPos: () => number;

  private wrapper: HTMLElement;
  private toolbar: HTMLElement | null = null;
  private tableElement: HTMLElement;
  private isSelected: boolean = false;

  constructor(node: ProseMirrorNode, view: EditorView, getPos: () => number) {
    console.log("Creating TableNodeView for node:", node.type.name);

    this.node = node;
    this.view = view;
    this.getPos = getPos;

    // 创建包装器
    this.wrapper = document.createElement("div");
    this.wrapper.className = "table-wrapper";
    this.wrapper.style.border = "2px solid red"; // 调试用的红边框

    // 创建实际的表格元素
    this.tableElement = document.createElement("table");
    this.tableElement.className = "custom-table";

    // 创建 tbody 作为内容容器
    this.contentDOM = document.createElement("tbody");
    this.tableElement.appendChild(this.contentDOM);

    // 简化版本：直接将表格添加到包装器
    this.wrapper.appendChild(this.tableElement);
    this.dom = this.wrapper;

    // 添加简单的事件监听
    this.setupBasicEventListeners();

    console.log(
      "TableNodeView created, dom:",
      this.dom,
      "contentDOM:",
      this.contentDOM
    );
  }

  private setupBasicEventListeners() {
    // 点击表格时选中
    this.tableElement.addEventListener("click", (e) => {
      e.stopPropagation();
      console.log("Table clicked!");
      this.selectTable();
    });

    // 鼠标悬停效果
    this.wrapper.addEventListener("mouseenter", () => {
      this.wrapper.style.backgroundColor = "rgba(0, 122, 204, 0.05)";
    });

    this.wrapper.addEventListener("mouseleave", () => {
      if (!this.isSelected) {
        this.wrapper.style.backgroundColor = "";
      }
    });
  }

  // 简化版本 - 暂时移除复杂的列宽调整功能

  private selectTable() {
    this.isSelected = true;
    this.wrapper.classList.add("selected");

    // 创建选区覆盖整个表格
    const pos = this.getPos();
    const tr = this.view.state.tr.setSelection(
      NodeSelection.create(this.view.state.doc, pos)
    );
    this.view.dispatch(tr);
  }

  private deleteTable() {
    console.log("Deleting table");
    const pos = this.getPos();
    const tr = this.view.state.tr.delete(pos, pos + this.node.nodeSize);
    this.view.dispatch(tr);
  }

  // NodeView 接口方法
  update(node: ProseMirrorNode): boolean {
    if (node.type !== this.node.type) return false;
    this.node = node;
    return true;
  }

  selectNode() {
    this.isSelected = true;
    this.wrapper.classList.add("selected");
  }

  deselectNode() {
    this.isSelected = false;
    this.wrapper.classList.remove("selected");
  }

  destroy() {
    // 移除所有事件监听器 - 由于我们没有保存引用，简单地移除整个DOM元素
    if (this.dom && this.dom.parentNode) {
      this.dom.parentNode.removeChild(this.dom);
    }
  }
}
