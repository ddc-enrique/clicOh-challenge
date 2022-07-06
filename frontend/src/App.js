import React from "react"
import {
  BrowserRouter,
  Switch,
  Redirect,
  Route
} from "react-router-dom"
import Home from "./pages/Home"
import "./App.css"

function App() {
  return (
    <div className='mainContainer'>
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={Home}/>
          <Redirect to="/" />
        </Switch>
      </BrowserRouter>
    </div>
  )
}

export default App
