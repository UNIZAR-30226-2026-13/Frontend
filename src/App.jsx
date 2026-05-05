import { useState } from 'react';
import Menu from './components/menu';
import JuegoIA from './modos/modoIA';
import JuegoLocal from './modos/modo1vs1';
import Inicio from './components/Inicio';
import Registro from './components/Registro';
import Perfil from './components/Perfil';
import { useGoogleLogin } from '@react-oauth/google';
import CrearPrivada from './components/CrearPrivada';
import JuegoPrivada from './modos/modoPrivada';


function App() {
  // MOCK: Empezamos directamente en el menú con un usuario de prueba
  const [modo, setModo] = useState('MENU'); 
  const [usuario, setUsuario] = useState({ username: 'Comandante_Mock', token: 'fake_token' });

  //const [modo, setModo] = useState('INICIO'); 
  //const [usuario, setUsuario] = useState(null);

  //const [IDjugador, setIDjugador] = useState(null); para cuando backedn

  const [configPrivada, setConfigPrivada] = useState(null);
  // para resetear partida IA
  const [idPartida, setidPartida] = useState(0);

  const manejarModo = (nuevoModo) => {
    if (nuevoModo === 'IA') {
      setidPartida(prev => prev + 1); // Suma 1 a la Key, forzando a React a reiniciar todo
    }
    setModo(nuevoModo);
  };

  
  const login = (datoUsuario) => {
    setUsuario(datoUsuario);
    //setIDjugador(id); para cuando backend
    setModo('MENU');
  }


  
  const googleLoginApp = useGoogleLogin({
    onSuccess: (respuesta) => login(respuesta.access_token),
    onError: () => alert('Error con Google')
  });

  const empezarPartidaPrivada = (configuracion) => {
    setConfigPrivada(configuracion); 
    setModo('JUGAR_PRIVADA'); 
  };

  return (
    <div style={{ height: '100vh',
                  width: '100vw',
                  background: '#1a1a1a',
                  margin: 0,
                  padding: 0}}>
      
      {modo === 'MENU' && (<Menu alElegir={manejarModo} usuario={usuario}/>)}

      {modo === 'IA' && (<JuegoIA key={idPartida} alSalir={() => setModo('MENU')} alElegir={manejarModo}/>)}

      {modo === '1VS1' && (<JuegoLocal alSalir={() => setModo('MENU')} />)}

      {modo === 'INICIO' && (<Inicio alAcceder={login}
                              irRegistro={() => setModo('REGISTRO')}
                              googleLogin={googleLoginApp}/>
                            )}
      
      {modo === 'REGISTRO' && (<Registro alVolverInicio={() => setModo('INICIO')}/>)}
      
      {modo === 'PERFIL' && (<Perfil alSalir={() => setModo('MENU')} usuario={usuario}/>)}

      {modo  === 'PRIVADA' && (<CrearPrivada alSalir={() => setModo('MENU')}
                                              alEmpezar={empezarPartidaPrivada}/>)}

      {modo === 'JUGAR_PRIVADA' && (<JuegoPrivada alSalir={() => setModo('MENU')} 
                                              configuracion={configPrivada} />)}
    </div>
  );
}

export default App;