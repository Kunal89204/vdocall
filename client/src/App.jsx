import React from 'react'
import {BrowserRouter as Router, Routes, Route} from "react-router-dom"
import Lobby from './screens/Lobby'
import Room from './screens/Room'


const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path='/' element={<Lobby />} />
          <Route path='/room/:roomId' element={<Room />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
