"use client";

import { Graph } from "@/components/Graph";
import { ExtensionCategory, register, treeToGraphData } from "@antv/g6";
import type { GraphOptions } from "@antv/g6";
import { ReactNode } from "@antv/g6-extension-react";
import { TreeNodeData } from "./ProseMirrorEditor";
import Node from "./Node";

interface TreeNodesProps {
  data?: TreeNodeData;
}

register(ExtensionCategory.NODE, "react", ReactNode);

/**
 * If the node is a leaf node
 * @param d - node data
 * @returns whether the node is a leaf node
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isLeafNode(d: any): boolean {
  return !d.children || d.children.length === 0;
}

export default function TreeNodes({ data }: TreeNodesProps) {
  // 如果没有传入数据，显示空状态
  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        暂无节点数据
      </div>
    );
  }
  const graphOptions: GraphOptions = {
    autoFit: "view",
    data: treeToGraphData(data),
    behaviors: [
      "drag-canvas",
      "zoom-canvas",
      "drag-element",
      "collapse-expand",
    ],
    node: {
      type: "react",
      style: (d) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const style: any = {
          labelText: d.id,
          labelPlacement: "right",
          labelOffsetX: 2,
          labelBackground: true,
        };
        if (isLeafNode(d)) {
          Object.assign(style, {
            labelTransform: [
              ["rotate", 90],
              ["translate", 18],
            ],
            labelBaseline: "center",
            labelTextAlign: "left",
          });
        }
        return {
          ...style,
          component: <Node data={d as unknown as TreeNodeData} />,
        };
      },
      animation: {
        enter: false,
      },
    },
    edge: {
      type: "cubic-vertical",
      animation: {
        enter: false,
      },
    },
    layout: {
      type: "dendrogram",
      direction: "TB", // H / V / LR / RL / TB / BT
      nodeSep: 80, // 增加水平间距，适应卡片宽度
      rankSep: 130, // 增加垂直间距，适应卡片高度
    },
  };

  return <Graph options={graphOptions} />;
}
