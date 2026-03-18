import { useState } from 'react';
import Menu from './components/menu';
import JuegoIA from './modos/modoIA';
import JuegoLocal from './modos/modo1vs1';
import Inicio from './components/Inicio'
import Registro from './components/Registro'


function App() {
  const [modo, setModo] = useState('INICIO'); 
  //const [IDjugador, setIDjugador] = useState(null); para cuando backedn
  
  const login = (id) => {
    //setIDjugador(id); para cuando backend
    setModo('MENU');
  }
  
  /*const googleLoginApp = () => {

  }*/

  return (
    <div style={{ height: '100vh',
                  width: '100vw',
                  background: '#1a1a1a',
                  margin: 0,
                  padding: 0}}>
      
      {modo === 'MENU' && (<Menu alElegir={setModo} />)}

      {modo === 'IA' && (<JuegoIA alSalir={() => setModo('MENU')} />)}

      {modo === '1VS1' && (<JuegoLocal alSalir={() => setModo('MENU')} />)}

      {modo === 'INICIO' && (<Inicio alAcceder={login}
                              irRegistro={() => setModo('REGISTRO')}
                              googleLogin={() => alert('Google por hacer')}/>
                            )}
      
      {modo === 'REGISTRO' && (<Registro alVolverInicio={() => setModo('INICIO')}/>)}
        
    </div>
  );
}

export default App;