
import { useRef, useEffect, useState } from 'react';

const Whiteboard: React.FC = () => {

  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    ws.onopen = () => {
      console.log("Connected to server");
    };
    ws.onmessage = (event) => {
      console.log("Message from server", event.data);
    };
    ws.onclose = () => {
      console.log("Disconnected from server");
    };
    ws.onerror = (event) => {
      console.log("Error from server", event);
    };
    setWs(ws);
  }, []);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const isDrawingRef = useRef(false);
  const [color, setColor] = useState('black');
  const [size, setSize] = useState(5);

  useEffect(() => {
    const canvas = canvasRef.current!;
    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const context = canvas.getContext('2d')!;
    context.scale(2, 2);
    context.lineCap = 'round';
    context.lineWidth = size;
    context.strokeStyle = color;
    contextRef.current = context;
  }, []);

  const startDrawing = ({ nativeEvent }: React.MouseEvent) => {
    const { offsetX, offsetY } = nativeEvent;
    // contextRef.current!.beginPath();
    // contextRef.current!.moveTo(offsetX, offsetY);
    lastPointRef.current = { x: offsetX, y: offsetY };
    
    isDrawingRef.current = true;
  };

  const finishDrawing = () => {
    // contextRef.current!.closePath();
    // isDrawingRef.current = false;
    isDrawingRef.current = false;
  lastPointRef.current = null;
  };

  const draw = ({ nativeEvent }: React.MouseEvent) => {
    if (!isDrawingRef.current) return;
    const { offsetX, offsetY } = nativeEvent;
    const from = lastPointRef.current!;
    const to = { x: offsetX, y: offsetY };
    renderLine(from, to, color, size);
    ws?.send(JSON.stringify({ from, to, color, size }));
    lastPointRef.current = to;

    // console.log(offsetX, offsetY);
    // contextRef.current!.lineTo(offsetX, offsetY);
    // contextRef.current!.stroke();
  };

  useEffect(() => {
    if (ws) {
    ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("from client",data.type);
  
    
      renderLine(
        data.from,
        data.to,
        data.color,
        data.size
      );
          
      };
    }
  }, [ws]);

  const renderLine = (
    from: { x: number; y: number },
    to: { x: number; y: number },
    color: string,
    size: number
  ) => {
    const ctx = contextRef.current!;
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
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

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={() => changeColor('black')} style={{ backgroundColor: 'black', color: 'white', marginRight: '5px' }}>Black</button>
        <button onClick={() => changeColor('red')} style={{ backgroundColor: 'red', color: 'white', marginRight: '5px' }}>Red</button>
        <button onClick={() => changeColor('green')} style={{ backgroundColor: 'green', color: 'white', marginRight: '5px' }}>Green</button>
        <button onClick={() => changeColor('blue')} style={{ backgroundColor: 'blue', color: 'white', marginRight: '5px' }}>Blue</button>
        <button onClick={() => changeColor('white')} style={{ backgroundColor: 'white', color: 'black', marginRight: '5px' }}>Eraser</button>
        <input type="range" name="size" value = {size} max={10}  onChange={e => changeSize(Number(e.target.value))}/>
        <button onClick={clearCanvas}>Clear Canvas</button>
      </div>
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={startDrawing}
        onMouseUp={finishDrawing}
        onMouseMove={draw}
        style={{ border: '1px solid black', display: 'block' }}
      />
    </div>
  );
};

export default Whiteboard;