"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GraphErrorFallbackProps {
  error?: Error;
  reset: () => void;
}

/**
 * Specialized error fallback for graph rendering failures
 */
const GraphErrorFallback: React.FC<GraphErrorFallbackProps> = ({
  error,
  reset,
}) => (
  <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
    <Card className="border-yellow-200 bg-yellow-50 max-w-md">
      <CardHeader>
        <CardTitle className="text-yellow-800 text-sm flex items-center gap-2">
          📊 图形渲染失败
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-yellow-700 text-xs">
            图形组件无法正常渲染，可能是由于：
          </p>
          <ul className="text-yellow-700 text-xs list-disc list-inside space-y-1">
            <li>数据格式不正确</li>
            <li>浏览器兼容性问题</li>
            <li>图形库加载失败</li>
          </ul>
          {error?.message && (
            <details className="mt-2">
              <summary className="text-yellow-600 text-xs cursor-pointer">
                技术详情
              </summary>
              <pre className="text-[10px] text-yellow-600 mt-1 bg-yellow-100 p-2 rounded overflow-auto">
                {error.message}
              </pre>
            </details>
          )}
          <div className="flex gap-2">
            <button
              onClick={reset}
              className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
            >
              重新渲染
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              刷新页面
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default GraphErrorFallback;
