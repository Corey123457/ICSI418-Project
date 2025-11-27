import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <BrowserRouter>
    <Routes>
        <Route path="/" element={<Login/>}></Route>
        <Route path="/Login" element= {<Login/>}></Route>
        </Routes>
</BrowserRouter>
  );
}

export default App;
