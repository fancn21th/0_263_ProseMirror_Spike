import type { GraphOptions } from "@antv/g6";
import { Graph as G6Graph } from "@antv/g6";
import { useEffect, useRef, useCallback } from "react";

export interface GraphProps {
  options: GraphOptions;
  onRender?: (graph: G6Graph) => void;
  onDestroy?: () => void;
}

export const Graph = (props: GraphProps) => {
  const { options, onRender, onDestroy } = props;
  const graphRef = useRef<G6Graph | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDestroy = useCallback(() => {
    onDestroy?.();
  }, [onDestroy]);

  const handleRender = useCallback(
    (graph: G6Graph) => {
      onRender?.(graph);
    },
    [onRender]
  );

  useEffect(() => {
    const graph = new G6Graph({ container: containerRef.current! });
    graphRef.current = graph;

    return () => {
      const graph = graphRef.current;
      if (graph) {
        graph.destroy();
        handleDestroy();
        graphRef.current = null;
      }
    };
  }, [handleDestroy]);

  useEffect(() => {
    const container = containerRef.current;
    const graph = graphRef.current;

    if (!options || !container || !graph || graph.destroyed) return;

    graph.setOptions(options);
    graph
      .render()
      .then(() => handleRender(graph))
      .catch((error) => console.debug(error));
  }, [options, handleRender]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
};
