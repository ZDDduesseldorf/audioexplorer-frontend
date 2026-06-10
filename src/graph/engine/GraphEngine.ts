export interface Vec2 {
  x: number;
  y: number;
}

export interface ViewportBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export type GraphEventType = 'afterRender' | 'enterNode' | 'leaveNode' | 'clickNode' | 'clickStage';

export interface NodeEventPayload {
  nodeId: string;
  position: Vec2;
}

export type GraphEventHandler =
  | { event: 'afterRender'; handler: () => void }
  | { event: 'enterNode'; handler: (payload: NodeEventPayload) => void }
  | { event: 'leaveNode'; handler: () => void }
  | { event: 'clickNode'; handler: (payload: NodeEventPayload) => void }
  | { event: 'clickStage'; handler: () => void };

export interface GraphEngine {
  panTo(x: number, y: number, duration?: number): void;
  getViewportBounds(): ViewportBounds;
  graphToViewport(pos: Vec2): Vec2;
  viewportToGraph(pos: Vec2): Vec2;
  getDimensions(): { width: number; height: number };
  refresh(): void;
  on<E extends GraphEventHandler>(event: E['event'], handler: E['handler']): void;
  off<E extends GraphEventHandler>(event: E['event'], handler: E['handler']): void;
  destroy(): void;
}
