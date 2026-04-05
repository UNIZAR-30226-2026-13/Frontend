import { useState } from 'react';
import Menu from './components/menu';
import JuegoIA from './modos/modoIA';
import JuegoLocal from './modos/modo1vs1';
import Inicio from './components/Inicio';
import Registro from './components/Registro';
import Perfil from './components/Perfil';
import { useGoogleLogin } from '@react-oauth/google';
import CrearPrivada from './components/CrearPrivada';


function App() {
  const [modo, setModo] = useState('INICIO'); 
  const [usuario, setUsuario] = useState(null);
  //const [IDjugador, setIDjugador] = useState(null); para cuando backedn
  
  const login = (id) => {
    setUsuario(id);
    //setIDjugador(id); para cuando backend
    setModo('MENU');
  }
  
  const googleLoginApp = useGoogleLogin({
    onSuccess: (respuesta) => login(respuesta.access_token),
    onError: () => alert('Error con Google')
  });

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
                              googleLogin={googleLoginApp}/>
                            )}
      
      {modo === 'REGISTRO' && (<Registro alVolverInicio={() => setModo('INICIO')}/>)}
      
      {modo === 'PERFIL' && (<Perfil alSalir={() => setModo('MENU')} usuario={usuario}/>)}

      {modo  === 'PRIVADA' && (<CrearPrivada alSalir={() => setModo('MENU')}/>)}
    </div>
  );
}

export default App;