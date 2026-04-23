import { useState } from 'react';
import logoGoogle from '../assets/LogoGoogle.webp';

function Inicio ({alAcceder, irRegistro, googleLogin}){
    const [usuario, setUsuario] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [cargando, setCargando] = useState(false); // backend
    const [error, setError] = useState('');

    const hacerLogin = async () => {
        setError('');
        setCargando(true);
        try {
            const res = await fetch('/api/usuario/login',{
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({username: usuario, password: contrasena}),
            });
            if (res.status === 200){
              const usuario = await res.json();
              alAcceder(usuario);
            } else if ( res.status === 453){
              setError('Usuario o contraseña incorrecta');
            } else{
              setError('Error del servidor');
            }
        } catch{
          setError('Error')
          setCargando(false);
        } finally {
          setCargando(false)
        }
    };
    /*const hacerLogin = () => {
        if (!usuario.trim() || !contrasena.trim()) {  // trim elimina espacios
            setError('Usuario y contraeña vacios');
            return;
        }
        alAcceder(usuario.trim());
    };*/

    const hacerLoginGoogle = () => {
        if (!usuario.trim()) {  // trim elimina espacios
            setError('Usuario vacios');
            return;
        }
        googleLogin();
    };

    return(
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100vw',
          height: '100vh',
          background: '#1a1a1a',
          color: 'white',
          gap: '20px'
        }}>
          <h1 style={{fontSize: '50px', color: '#ffffff', marginBottom: '40px'}}>
            HUNDE LA FLOTA 
          </h1>
          <h2 style={{ color: '#ffffff', fontSize: '14px', marginBottom: '20px' }}>
            Inicia sesión para jugar
          </h2>
          {error && <p style={{ color: '#ef4444', margin: '0' }}>{error}</p>}
            <input
              type="text"
              placeholder="Usuario"
              value={usuario}
              onChange={texto => setUsuario(texto.target.value)}
              style={inputStylee}/>

            <input
              type="password"
              placeholder="Contraseña"
              value={contrasena}
              onChange={texto => setContrasena(texto.target.value)}
              style={inputStylee}/>

            <button
              onClick={hacerLogin}
              disabled={cargando}
              style={botomStyle}>

              Iniciar sesión
            </button>

            <button
              onClick={hacerLoginGoogle}
              style={botomStyle}>
              <img src={logoGoogle} width="25" style={{ marginRight: '10px',verticalAlign: 'middle'}}/>

              Continua con Google
            </button>

            <span onClick={irRegistro} style={{color: 'white', cursor: 'pointer', transition: 'all 0.5s'}}>
              ¿No tienes cuenta? Regístrate
            </span>

            
        </div>
    );
}
const inputStylee={padding: '15px 40px',
      background: '#111',
      border: '2px solid #555',
      color: 'white',
      fontSize: '15px',
      outline: 'none'
}

const botomStyle = {  padding: '15px 40px',
  fontSize: '15px',
  fontWeight: 'bold',
  background: '#ffffff',
  color: '#080808',
  border: '2px solid #555',
  borderRadius: '10px',
  cursor: 'pointer',
  width: '300px',
  transition: 'all 0.3s'
}

export default Inicio;