/**
 * ProseMirror 相关的类型定义
 */

/**
 * 树节点的数据结构，用于可视化 ProseMirror 文档结构
 */
export interface TreeNodeData {
  /** 节点唯一标识符 */
  id: string;
  /** 节点类型名称 */
  nodeType: string;
  /** 文本内容（如果是文本节点） */
  text?: string;
  /** 节点属性 */
  attrs?: Record<string, unknown>;
  /** 标记数组（格式化信息） */
  marks?: string[];
  /** 节点在文档中的位置 */
  position?: number;
  /** 节点大小 */
  nodeSize?: number;
  /** 子节点数组 */
  children?: TreeNodeData[];
}

/**
 * 编辑器配置选项
 */
export interface EditorConfig {
  /** 编辑器初始内容 */
  initialContent?: string;
  /** 是否启用调试模式 */
  debugMode?: boolean;
  /** 自动保存间隔（毫秒） */
  autoSaveInterval?: number;
}

/**
 * 图形布局配置
 */
export interface GraphLayoutConfig {
  /** 节点间水平距离 */
  nodeSep: number;
  /** 层级间垂直距离 */
  rankSep: number;
  /** 布局方向 */
  direction: "TB" | "BT" | "LR" | "RL";
}

/**
 * 节点卡片样式配置
 */
export interface NodeCardConfig {
  /** 卡片宽度 */
  width: number;
  /** 卡片最大高度 */
  maxHeight: number;
  /** 文本截断长度 */
  textTruncateLength: number;
  /** 最大显示标记数量 */
  maxMarksDisplay: number;
}
