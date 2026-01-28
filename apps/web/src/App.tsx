
import { BrowserRouter, Route, Routes } from "react-router"
import { Play } from "@/pages/Play"

function App() {


  return (

    <BrowserRouter>
      <Routes>
        <Route path="/play" element={<Play />} />
      </Routes>
    </BrowserRouter>

  )
}

export default App