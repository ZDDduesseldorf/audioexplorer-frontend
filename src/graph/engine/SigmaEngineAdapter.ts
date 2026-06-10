import Sigma from 'sigma';
import type { GraphEngine, Vec2, ViewportBounds, GraphEventHandler } from './GraphEngine';

export class SigmaEngineAdapter implements GraphEngine {
  constructor(private sigma: Sigma) {}

  panTo(x: number, y: number, duration = 250): void {
    const framed = this.sigma.viewportToFramedGraph(this.sigma.graphToViewport({ x, y }));
    this.sigma.getCamera().animate({ x: framed.x, y: framed.y }, { duration });
  }

  getViewportBounds(): ViewportBounds {
    const dims = this.sigma.getDimensions();
    const tl = this.sigma.viewportToGraph({ x: 0, y: 0 });
    const br = this.sigma.viewportToGraph({ x: dims.width, y: dims.height });
    return {
      minX: Math.min(tl.x, br.x),
      maxX: Math.max(tl.x, br.x),
      minY: Math.min(tl.y, br.y),
      maxY: Math.max(tl.y, br.y),
    };
  }

  graphToViewport(pos: Vec2): Vec2 {
    return this.sigma.graphToViewport(pos);
  }

  viewportToGraph(pos: Vec2): Vec2 {
    return this.sigma.viewportToGraph(pos);
  }

  getDimensions(): { width: number; height: number } {
    return this.sigma.getDimensions();
  }

  refresh(): void {
    this.sigma.refresh();
  }

  on<E extends GraphEventHandler>(event: E['event'], handler: E['handler']): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.sigma.on(event as any, handler as any);
  }

  off<E extends GraphEventHandler>(event: E['event'], handler: E['handler']): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.sigma.removeListener(event as any, handler as any);
  }

  destroy(): void {
    this.sigma.kill();
  }
}
