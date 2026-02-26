import { useState } from 'react';
import Menu from './components/menu';
import JuegoIA from './modos/modoIA';
import JuegoLocal from './modos/modo1vs1';

function App() {
  const [modo, setModo] = useState('MENU'); 

  return (
    <div style={{ height: '100vh',
                  width: '100vw',
                  background: '#1a1a1a',
                  margin: 0,
                  padding: 0}}>
      
      {modo === 'MENU' && (<Menu alElegir={setModo} />)}

      {modo === 'IA' && (<JuegoIA alSalir={() => setModo('MENU')} />)}

      {modo === '1VS1' && (<JuegoLocal alSalir={() => setModo('MENU')} />)}

    </div>
  );
}

export default App;