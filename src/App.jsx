import Tablero from './components/tablero';
import './styles/App.css';

function App() {
  return (
    <div className="App">
      <h1>Hunde la Flota</h1>
      <p>Haz clic en los cuadros para atacar</p>
      <Tablero />
    </div>
  );
}

export default App;