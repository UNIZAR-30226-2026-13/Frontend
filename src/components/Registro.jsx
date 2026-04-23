import { useState } from 'react';


function Registro({alVolverInicio}){

  const[usuario, setUsuario] = useState('');
  const[contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState(''); 
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false); // backend
  const [email, setEmail] = useState('')

    const registrarse = async () => {
      if (!usuario.trim() || !contrasena.trim() || !confirmarContrasena.trim() || !email.trim()) {
        setError('Rellena todos los campos');
        return;
      }
      if (contrasena !== confirmarContrasena) {
        setError('Las contraseñas no coinciden');
        return;
      }
      setCargando(true);
      setError('');
      try {
        const res = await fetch('/api/usuario/registro', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: usuario, email: email, password: contrasena }),
        });
        if (res.status === 200) {
          alVolverInicio();
        } else if (res.status === 453) {
          setError('El usuario o email ya están en uso');
        } else {
          setError('Error del servidor');
        }
      } catch {
        setError('Error de red');
      } finally {
        setCargando(false);
      }
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
          <h2 style={{ color: '#ffffff', fontSize: '20px', marginBottom: '40px' }}>
            Crea tu cuenta
          </h2>
            {error && <p style={{ color: '#ef4444', margin: '0' }}>{error}</p>}
            <input
              type="text"
              placeholder="Usuario"
              value={usuario}
              onChange={texto => setUsuario(texto.target.value)}
              style={inputStylee}/>

            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={texto => setEmail(texto.target.value)}
              style={inputStylee}/>

            <input
              type="password"
              placeholder="Contraseña"
              value={contrasena}
              onChange={texto => setContrasena(texto.target.value)}
              style={inputStylee}/>

            <input
              type="password"
              placeholder="Confirmar contraseña"
              value={confirmarContrasena}
              onChange={texto => setConfirmarContrasena(texto.target.value)}
              style={inputStylee}/>

            <button
              onClick={registrarse}
              style={botomStyle}>
                Crear cuenta
            </button>

            <button onClick={alVolverInicio} style={{
              background: '#ef4444', color: 'white', border: 'none', 
              padding: '8px 15px', borderRadius: '5px', cursor: 'pointer',
              position: 'absolute', top: '30px', left:'30px'
            }}>
              ← Inicio de sesión
            </button>
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
  fontSize: '20px',
  fontWeight: 'bold',
  background: '#ffffff',
  color: '#080808',
  border: '2px solid #555',
  borderRadius: '10px',
  cursor: 'pointer',
  width: '300px',
  transition: 'all 0.3s'
}
export default Registro;