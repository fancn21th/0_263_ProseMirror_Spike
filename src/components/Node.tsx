import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TreeNodeData } from "@/types/prosemirror";

interface NodeProps {
  data: TreeNodeData;
}

const Node = ({ data }: NodeProps) => {
  const { nodeType, text, marks, position, nodeSize, children } = data;

  return (
    <Card className="w-48 max-h-[100px] overflow-hidden">
      <CardHeader className="pb-0 px-3 pt-2">
        <CardTitle className="text-xs font-medium truncate leading-tight">
          {nodeType}
        </CardTitle>
        {text && (
          <CardDescription className="text-[10px] text-gray-500 truncate leading-tight mt-0">
            &quot;{text.length > 20 ? text.substring(0, 20) + "..." : text}
            &quot;
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="px-3 py-2 pb-2 space-y-1">
        {/* 核心信息：位置和大小 */}
        <div className="flex justify-between text-[10px] leading-tight">
          <span className="text-blue-600 font-mono">
            pos:{position ?? "N/A"}
          </span>
          <span className="text-green-600 font-mono">
            size:{nodeSize ?? "N/A"}
          </span>
          {children && children.length > 0 && (
            <span className="text-purple-600 font-mono">
              child:{children.length}
            </span>
          )}
        </div>

        {/* 标记信息 - 紧凑显示 */}
        {marks && marks.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {marks.slice(0, 2).map((mark, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-[9px] px-1 py-0 h-3 leading-none"
              >
                {mark}
              </Badge>
            ))}
            {marks.length > 2 && (
              <span className="text-[9px] text-gray-400">
                +{marks.length - 2}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Node;
