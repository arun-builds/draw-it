
import Whiteboard from "./components/Whiteboard"

function App() {
  

  return (
    <div className="flex min-h-svh flex-col items-center justify-center">
      <div className="w-full h-ful">
        <Whiteboard />
        {/* <Button onClick={() => ws?.send("Hello from client")}>Send Message</Button> */}
      </div>
    </div>
  )
}

export default App