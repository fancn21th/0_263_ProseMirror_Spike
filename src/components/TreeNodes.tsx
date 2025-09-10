"use client";

import { Graph } from "@/components/Graph";
import { treeToGraphData } from "@antv/g6";
import type { GraphOptions } from "@antv/g6";
import { TreeNodeData } from "./ProseMirrorEditor";

interface TreeNodesProps {
  data?: TreeNodeData;
}

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
        return style;
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
      nodeSep: 50,
      rankSep: 120,
    },
  };

  return <Graph options={graphOptions} />;
}
