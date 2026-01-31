import { useRef, useEffect, useState, useCallback } from 'react';
import { useSocketContext } from '@/contexts/SocketContext';
import type { DrawPayload } from '@/contexts/SocketContext';

const Whiteboard: React.FC = () => {
  const { sendDraw, onDraw, userId } = useSocketContext();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const isDrawingRef = useRef(false);
  const [color, setColor] = useState('black');
  const [size, setSize] = useState(5);

  const renderLine = useCallback((
    from: { x: number; y: number },
    to: { x: number; y: number },
    strokeColor: string,
    strokeSize: number
  ) => {
    const ctx = contextRef.current;
    if (!ctx) return;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeSize;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }, []);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current!;
    const context = canvas.getContext('2d')!;
    context.lineCap = 'round';
    context.lineWidth = size;
    context.strokeStyle = color;
    contextRef.current = context;
  }, []);

  // Subscribe to incoming draw events from other users
  useEffect(() => {
    const unsubscribe = onDraw((data: DrawPayload, fromUserId: string) => {
      // Only render if it's from another user
      if (fromUserId !== userId) {
        renderLine(data.from, data.to, data.color, data.size);
      }
    });
    return unsubscribe;
  }, [onDraw, userId, renderLine]);

  const startDrawing = ({ nativeEvent }: React.MouseEvent) => {
    const { offsetX, offsetY } = nativeEvent;
    lastPointRef.current = { x: offsetX, y: offsetY };
    isDrawingRef.current = true;
  };

  const finishDrawing = () => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  };

  const draw = ({ nativeEvent }: React.MouseEvent) => {
    if (!isDrawingRef.current) return;
    const { offsetX, offsetY } = nativeEvent;
    const from = lastPointRef.current!;
    const to = { x: offsetX, y: offsetY };
    
    // Render locally
    renderLine(from, to, color, size);
    
    // Send to other users via socket
    sendDraw({ from, to, color, size });
    
    lastPointRef.current = to;
  };

  const changeColor = (newColor: string) => {
    contextRef.current!.strokeStyle = newColor;
    setColor(newColor);
  };

  const changeSize = (newSize: number) => {
    contextRef.current!.lineWidth = newSize;
    setSize(newSize);
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const colors = [
    '#000000', '#FFFFFF', '#9CA3AF',
    '#EF4444', '#F97316', '#EAB308', 
    '#22C55E', '#3B82F6', '#8B5CF6',
  ];

  return (
    <div className="flex flex-col">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={720}
        height={480}
        onMouseDown={startDrawing}
        onMouseUp={finishDrawing}
        onMouseLeave={finishDrawing}
        onMouseMove={draw}
        className="bg-white cursor-crosshair rounded-t-lg"
      />

      {/* Toolbar */}
      <div className="bg-zinc-800 border border-zinc-700 border-t-0 rounded-b-lg px-4 py-3 flex items-center gap-6">
        {/* Colors */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-400 font-medium">Color</span>
          <div className="flex gap-1">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => changeColor(c)}
                className={`w-7 h-7 rounded transition-all ${
                  color === c 
                    ? 'ring-2 ring-offset-2 ring-offset-zinc-800 ring-emerald-500 scale-110' 
                    : 'hover:scale-105'
                }`}
                style={{ backgroundColor: c, border: c === '#FFFFFF' ? '1px solid #52525b' : 'none' }}
              />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-zinc-700"></div>

        {/* Size */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-400 font-medium">Size</span>
          <div className="flex gap-1">
            {[2, 5, 10, 18].map((s) => (
              <button
                key={s}
                onClick={() => changeSize(s)}
                className={`w-8 h-8 rounded flex items-center justify-center transition-all ${
                  size === s 
                    ? 'bg-emerald-600' 
                    : 'bg-zinc-700 hover:bg-zinc-600'
                }`}
              >
                <div 
                  className="rounded-full bg-white"
                  style={{ width: Math.min(s, 14), height: Math.min(s, 14) }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-zinc-700"></div>

        {/* Clear */}
        <button
          onClick={clearCanvas}
          className="bg-red-600 hover:bg-red-500 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default Whiteboard;