import { Routes, Route } from "react-router-dom";
import Login_Page from "./login";
import Dashboard from "./Dashboard";

function App() {
return(
  <Routes>
    <Route path='/' element={<Login_Page />} />
    <Route path='/dashboard' element={<Dashboard />} />
  </Routes>
)}

export default App;