import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';
import HomePage from "./components/homepage/HomePage"
import Chat from './components/chat/Chat'

function App() {
  return (
    <div className="App">
      <BrowserRouter basename='/'>

        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/chat' element={<Chat />} />
        </Routes>
      </BrowserRouter>

    </div>
  );
}

export default App;
