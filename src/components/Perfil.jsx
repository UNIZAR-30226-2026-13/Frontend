import { useState, useEffect } from "react" 
import IconoDefaul from '../assets/IconoDefault.png'
import { SKINS, FOTOS } from '../constants/configuracion.js'
import dorado from '../assets/skinDorada.png'
import militar from '../assets/skinMilitar.png'
import defaul from '../assets/skinDefault.png'
import fantasma from '../assets/skinFantasma.png'

import azteca from '../assets/perfilAzteca.png'
import calavera from '../assets/perfilCalavera.png'
import casco from '../assets/perfilCasco.png'
import dragon from '../assets/perfilDragon.png'
import espectro from '../assets/perfilFantasma.png'


const PREVIEW_SKINS = {
  default:  { img: defaul, nombre: 'Deafult'    },
  militar:  { img: militar, nombre: 'Militar'  },
  dorado:   { img: dorado, nombre: 'Dorado'   },
  fantasma: { img: fantasma, nombre: 'Fantasma' },
};

const FOTOS_PERFIL = {
  default:  { img: IconoDefaul, nombre: 'Default'},
  azteca:  { img: azteca, nombre: 'Azteca'},
  calavera:  { img: calavera, nombre: 'Calavera'},
  casco: { img: casco, nombre: 'Casco'},
  dragon: { img: dragon, nombre: 'Dragon'},
  espectro: { img: espectro, nombre: 'Espectro'},
};

const guardarConfig = async (campo, valor, usuario) => {
  const pass = localStorage.getItem('_pass');
  await fetch('/api/usuario/configuracion', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newData: { 
      username: usuario.username, 
      email: usuario.email,      
      password: pass, 
      barco: usuario.barco || 'default',
      perfil: usuario.perfil || 'default',
      [campo]: valor 
    }})
  });
};

function Perfil({ alSalir, usuario, actualizarUsuario }){
    const [pantalla, setPantalla] = useState('PERFIL');
    const [fotoActual, setFotoActual] = useState(usuario?.perfil || 'default');
    const imgFoto = FOTOS_PERFIL[fotoActual]?.img || IconoDefault;

    return(
        <div style={{
          display: 'flex',
          width: '100vw',
          height: '100vh',
          background: '#1a1a1a',
          color: 'white',
          overflow: 'hidden'
        }}>
          
          {/*Barra lateral*/}
          <div style={{
            display: 'flex',
            width: '200px',
            height:'100vh',
            background: '#080808',
            borderRight: '2px solid #333',
            flexDirection: 'column',
            padding: '10px',
            boxSizing: 'border-box'
          }}>
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center', 
              gap: '8px', 
              padding: '20px', 
              borderBottom: '1px solid #333' 
            }}>
              <div style={{
                width: '60px', 
                height: '60px', 
                borderRadius: '50%',
                background: '#555', 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center', 
                fontSize: '28px',
                overflow: 'hidden'
              }}>
                <img 
                  src={imgFoto} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
               />
              </div>
              <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{usuario?.username || 'Jugador'}</span>
            </div>

            {['PERFIL', 'SKINS', 'FOTO'].map(pant => (        // array de pantallas
              <div
                key={pant}
                onClick={() => setPantalla(pant)}
                style={{
                  padding: '16px 24px',
                  cursor: 'pointer',
                  background: pantalla === pant ? '#333' : 'transparent',   //
                  borderLeft: pantalla === pant ? '3px solid white' : '3px solid transparent', //borde balnquito
                  fontSize: '15px',
                  fontWeight: pantalla === pant ? 'bold' : 'normal'  //negrita o no
                  
                }}>
                {pant}
              </div>
            ))}

            <button
              onClick={alSalir}
              style={{
                marginTop: 'auto',
                padding: '15px',
                fontSize: '15px',
                fontWeight: 'bold',
                background: '#ffffff',
                color: '#080808',
                border: '2px solid #555',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}>
                ← Salir al Menú
            </button>
          </div>

          <div style={{
            flex: 1,
            padding: '40px',  
            overflowY: 'auto',
            height: '100vh'
          }}>
            {pantalla === 'PERFIL' && <PantallaPerfil usuario={usuario} actualizarUsuario={actualizarUsuario} imgFoto={imgFoto}/>}
            {pantalla === 'SKINS' && <PantallaSkins usuario={usuario} actualizarUsuario={actualizarUsuario}/>}
            {pantalla === 'FOTO'   && <PantallaFoto fotoActual={fotoActual} setFotoActual={setFotoActual} imgFoto={imgFoto} usuario={usuario} actualizarUsuario={actualizarUsuario}/>}

        </div>
      </div>
    )
}

function HistorialPartidas({ historial, username }) {

  if (historial === null) {   // ← esto lo quitaste y hace falta
    return <p style={{ color: '#555', textAlign: 'center' }}>
      Cargando historial
    </p>
  }
  if (historial.length === 0) {
    return <p style={{ color: '#555', textAlign: 'center' }}>
      Sin partidas
    </p>
  }
 
  return historial.map((partida, i) => {
    const rival = partida.owner_username === username ? partida.guest_username : partida.owner_username
    const gane = partida.ganador_id === username
    const fecha = partida.fecha ? new Date(partida.fecha).toLocaleDateString('es-ES') : '—'
    const tipo = partida.ranked ? ' Ranked' : 'Normal'
 
    return (
      <div key={partida.id || i} style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        borderBottom: '1px solid #444',
        color: gane ? '#10b981' : '#ef4444'
      }}>
        <span style={{ flex: 1 }}>
          vs {rival}
        </span>
        <span style={{ flex: 1, color: '#aaa' }}>
          {tipo}
        </span>
        <span style={{ flex: 1, fontWeight: 'bold' }}>
          {gane ? 'Victoria' : 'Derrota'}
        </span>
        <span style={{ color: '#aaa' }}>
          {fecha}
        </span>
      </div>
    )
  })
}

function PantallaPerfil({ usuario, actualizarUsuario ,imgFoto}) {
  const [editando, setEditando] = useState(false);
  const [nuevoUsername, setNuevoUsername] = useState(usuario?.username || '');
  const [nuevoEmail, setNuevoEmail] = useState(usuario?.email || '');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(false);
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [historial, setHistorial] = useState(null);
  const esCuentaGoogle = localStorage.getItem('_pass')?.startsWith('google_');
  const [confirmandoBorrar, setConfirmandoBorrar] = useState(false)

  useEffect(() => {
    const cargarHistorial = async () => {
      try {
        const res = await fetch(`/api/terminadas/${usuario?.username}`);
        if (res.status === 200) {
          const datos = await res.json();
          setHistorial(datos);
        } else {
          setHistorial([]);
        }
      } catch (e) {
        console.error('Error cargando historial:', e);
        setHistorial([]);
      }
    };
    if (usuario?.username) cargarHistorial();
  }, [usuario?.username]);

  const eliminarCuenta = async () => {
    try {
      const res = await fetch('/api/usuario/eliminar', {
        method: 'DELETE',
        credentials: 'include'
      })
      if (res.status === 200) {
        window.location.reload()
      }
    } catch {
      console.error('Error al eliminar cuenta')
    }
  }

  const guardar = async () => {
    const pass = localStorage.getItem('_pass');
    setGuardando(true);
    setError('');
    setExito(false);
    try {
      const res = await fetch('/api/usuario/configuracion', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newData: { username: nuevoUsername, email: usuario.email, password: nuevaContrasena.trim() !== '' ? nuevaContrasena : localStorage.getItem('_pass') } })
      });
      if (res.status === 200) {
          // Recargar datos actualizados desde la API
        const perfilActualizado = await fetch(`/api/usuario/${nuevoUsername}`);
        if (perfilActualizado.status === 200) {
          const datos = await perfilActualizado.json();
          actualizarUsuario(datos);
          setNuevoUsername(datos.username);
          setNuevoEmail(datos.email);
        }
        setEditando(false);
        setExito(true);
        setTimeout(() => setExito(false), 3000);
      } else {
        setError('Error al guardar los cambios');
      }
    } catch (e) {
      console.error('Error al guardar:', e);
      setError('Error de red');
    } finally {
      setGuardando(false);
    }
  };

  const cancelar = () => {
    setNuevoUsername(usuario?.username || '');
    setNuevoEmail(usuario?.email || '');
    setError('');
    setEditando(false);
    setNuevaContrasena('');
  };

  return (
    <div style={{ display: 'flex', 
      flexDirection: 'column', 
      gap: '40px' 
    }}>
 
      {/*foto y datos */}
      <div style={{
        display: 'flex', 
        gap: '40px'
      }}>
 
        <div style={{ display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '12px' 
          }}>
          <p style={{ margin: 0, color: '#ffffff', fontSize: '14px' }}>Foto de usuario</p>
          <div style={{
            width: '300px', 
            height: '300px', 
            borderRadius: '50px',
            background: '#333', 
            border: '2px solid #555',
            color: '#555',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '60px',
            overflow: 'hidden'
          }}>
            <img 
              src={imgFoto} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              alt="Perfil" 
            />
          </div>
        </div>
 
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '16px', 
          flex: 1               // asi ocupa el tamaño restante
        }}>
          <div>
            <p style={{ margin: '8px', color: '#ffffff', fontSize: '14px' }}>Nombre de usuario</p>
            <input 
              value={nuevoUsername}
              onChange={e => setNuevoUsername(e.target.value)}
              disabled={!editando}
              style={{padding: '12px',
                width: '100%',
                boxSizing: 'border-box',
                borderRadius: '10px',
                fontSize: '16px',
                outline: 'none',
                background: editando ? '#111' : '#333',
                border: editando ? '2px solid #3b82f6' : '2px solid #555',
                color: editando ? 'white' : '#555',
                cursor: editando ? 'text' : 'default'
              }}
            />
          </div>
          <div>
            <p style={{ margin: '8px', color: '#ffffff', fontSize: '14px' }}>Correo electrónico</p>
            <input
              value={nuevoEmail}
              onChange={e => setNuevoEmail(e.target.value)}
              disabled={true}
              style={{padding: '12px',
                width: '100%',
                boxSizing: 'border-box',
                borderRadius: '10px',
                fontSize: '16px',
                outline: 'none',
                background: '#333',
                border: '2px solid #555',
                color: '#555',
                cursor: 'default'
              }}
            />
          </div>
          {!esCuentaGoogle && (
            <div>
              <p style={{ margin: '8px', color: '#ffffff', fontSize: '14px' }}>Contraseña</p>
              {editando ? (
                <input
                  type="password"
                  placeholder="Nueva contraseña (dejar vacío para no cambiar)"
                  value={nuevaContrasena}
                  onChange={e => setNuevaContrasena(e.target.value)}
                  style={{padding: '12px',
                  width: '100%',
                  boxSizing: 'border-box',
                  borderRadius: '10px',
                  fontSize: '16px',
                  outline: 'none',
                  background: editando ? '#111' : '#333',
                  border: editando ? '2px solid #3b82f6' : '2px solid #555',
                  color: editando ? 'white' : '#555',
                  cursor: editando ? 'text' : 'default'
                }}
                />
              ) : (
                <div style={{
                  padding: '12px',
                  background: '#333', 
                  border: '2px solid #555',
                  borderRadius: '10px', 
                  fontSize: '16px', 
                  color: '#555'
                }}>
                  ••••••••
                </div>
              )}
            </div>
          )}

          {error && <p style={{ color: '#ef4444', fontSize: '13px', margin: 0 }}>{error}</p>}
          {exito && <p style={{ color: '#10b981', fontSize: '13px', margin: 0 }}>✓ Cambios guardados</p>}
          
          {!editando ? (
            <button onClick={() => setEditando(true)} style={{
              padding: '8px 16px', background: '#3b82f6', color: 'white',
              border: 'none', borderRadius: '10px', cursor: 'pointer',
              fontWeight: 'bold', fontSize: '15px'
            }}>
              Editar perfil
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={guardar} disabled={guardando} style={{
                padding: '8px 16px', background: 'transparent', color: '#10b981',
                border: '1px solid #10b981', borderRadius: '8px', cursor: 'pointer',
                fontSize: '13px'
              }}>
                {guardando ? 'Guardando...' : ' Guardar'}
              </button>
              <button onClick={cancelar} style={{
                padding: '8px 16px', background: 'transparent', color: '#d81818',
                border: '1px solid #d81818', borderRadius: '8px', cursor: 'pointer',
                fontSize: '13px'
              }}>
                Cancelar
              </button>
            </div>
          )}
          {!confirmandoBorrar ? (
            <button onClick={() => setConfirmandoBorrar(true)} style={{
              padding: '8px 16px', background: 'transparent', color: '#ef4444',
              border: '1px solid #ef4444', borderRadius: '8px', cursor: 'pointer', fontSize: '13px'
            }}>
              Eliminar cuenta
            </button>
          ) : (
            <>
              <span style={{ color: '#aaa', fontSize: '13px' }}>¿Seguro?</span>
              <button onClick={eliminarCuenta} style={{
                padding: '8px 16px', background: '#ef4444', color: 'white',
                border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px'
              }}>
                Si, eliminar
              </button>
              <button onClick={() => setConfirmandoBorrar(false)} 
                style={{
                  padding: '8px 16px', 
                  background: 'transparent', 
                  color: '#aaa',
                  border: '1px solid #555', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  fontSize: '13px'
                }}>
                  Cancelar
              </button>
            </>
          )}
        </div>
      </div>
 
      <div>
        <p style={{ margin: '12px', color: '#ffffff', fontSize: '14px' }}>
          Estadísticas
        </p>
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          {[
            {label: 'Partidas jugadas', valor: usuario?.partidas_jugadas ?? 0 },
            {label: 'Partidas ganadas', valor: usuario?.partidas_ganadas ?? 0 },
            {label: 'ELO', valor: usuario?.elo ?? 1000 },
          ].map(stat => (
            <div 
              key={stat.label} 
              style={{
                flex: 1, 
                background: '#333', 
                border: '2px solid #555',
                borderRadius: '10px', 
                padding: '16px', 
                textAlign: 'center'
              }}>
              <p style={{ margin: '0 0 6px 0', color: '#aaa', fontSize: '12px' }}>
                {stat.label}
              </p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
                {stat.valor}
              </p>
            </div>
          ))}
        </div>
 
        <p style={{ margin: '12px', color: '#ffffff', fontSize: '14px' }}>
          Historial de partidas
        </p>
        <div style={{
          background: '#333', border: '2px solid #555', borderRadius: '10px',
          padding: '16px', minHeight: '120px'
        }}>
          <HistorialPartidas historial={historial} username={usuario?.username} />
        </div>
      </div>
 
    </div>
  );
}

function PantallaSkins({ usuario, actualizarUsuario}){
  const [skinActual, setSkinActual] = useState(usuario?.barco || 'default');

  /*const elegirSkin = (id) => {
    localStorage.setItem('skin',id);
    setSkinActual(id);
  };*/

  const elegirSkin = async (id) => {
    setSkinActual(id);
    try {
      await guardarConfig('barco', id, usuario);
      // Actualizar estado global para que el juego use la skin nueva
      actualizarUsuario({ ...usuario, barco: id });
    } catch (e) {
      console.error('Error guardando skin:', e);
    }
  };

  return(
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      gap: '40px'
    }}>
      <div>
        <h2 style={{ margin: '0 0 6px 0', fontSize: '48px' }}>
          Skins de los barcos
        </h2>
        <p style={{ margin: 0, color: '#b8b8b8', fontSize: '18px' }}>
          Elige la skins de tus barcos
        </p>
      </div>
      <div style={{
        display: 'flex',
        gap: '40px',
        flexWrap: 'wrap'
       }}>
        {Object.values(SKINS).map(skin => {
          const skinSeleccionada = skinActual === skin.id;

          return(
            <div
              key={skin.id}
              onClick={() => elegirSkin(skin.id)}
              style={{
                padding: '16px',
                borderRadius: '12px',
                cursor: 'pointer',
                border: skinSeleccionada ? '2px solid #3b82f6' : '2px solid #444',
                background: skinSeleccionada ? '#1e2a3a' : '#222',
                boxShadow: skinSeleccionada ? '0 0 15px rgba(59,130,246,0.4)' : 'none',
                transform: skinSeleccionada ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.2s',
                textAlign: 'center',
                minWidth: '140px',
              }}
            >
              <img
                src={PREVIEW_SKINS[skin.id]?.img}
                style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '50%' }}
              />
              <p style={{ margin: '10px 0 4px 0', fontWeight: 'bold', fontSize: '15px' }}>
                {skin.nombre}
              </p>
              {skinSeleccionada && (
                <span style={{
                  fontSize: '11px', fontWeight: 'bold', color: '#3b82f6',
                  background: 'rgba(59,130,246,0.15)', padding: '2px 10px',
                  borderRadius: '20px', border: '1px solid #3b82f6'
                }}>
                  ACTIVA
                </span>
              )}
            </div>
          );
          
        })}
      </div>
    </div>
  );
}

function PantallaFoto({ fotoActual, setFotoActual , imgFoto, actualizarUsuario, usuario}) {
  /*const elegirFoto = (id) => {
    localStorage.setItem('fotoPerfil', id);
    setFotoActual(id);
    // TODO: llamar a API cuando esté implementada
  };*/
  const elegirFoto = async (id) => {
    setFotoActual(id);
    try {
      await guardarConfig('perfil', id, usuario);
      // Actualizar estado global
      actualizarUsuario({ ...usuario, perfil: id });
    } catch (e) {
      console.error('Error guardando foto:', e);
    }
  };
 
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      <div>
        <h2 style={{ margin: '0 0 6px 0', fontSize: '48px' }}>
          Foto de perfil
        </h2>
        <p style={{ margin: 0, color: '#b8b8b8', fontSize: '18px' }}>
          Elige tu foto de perfil
        </p>
      </div>
      <div style={{
        display: 'flex',
        gap: '40px',
        flexWrap: 'wrap'
      }}>
        {Object.values(FOTOS).map(foto => {
          const seleccionada = fotoActual === foto.id;

          return (
            <div
              key={foto.id}
              onClick={() => elegirFoto(foto.id)}
              style={{
                height: '140px',
                wwidth: '140px',
                padding: '16px',
                borderRadius: '12px',
                cursor: 'pointer',
                border: seleccionada ? '2px solid #3b82f6' : '2px solid #444',
                background: seleccionada ? '#1e2a3a' : '#222',
                boxShadow: seleccionada ? '0 0 15px rgba(59,130,246,0.4)' : 'none',
                transform: seleccionada ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.2s',
                textAlign: 'center',
                minWidth: '140px',
              }}
            >
              <img 
                src={FOTOS_PERFIL[foto.id]?.img}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
              <p style={{ margin: '10px 0 4px 0', fontWeight: 'bold', fontSize: '15px' }}>
                {foto.nombre}
              </p>
              {seleccionada && (
                <span style={{
                  fontSize: '11px', fontWeight: 'bold', color: '#3b82f6',
                  background: 'rgba(59,130,246,0.15)', padding: '2px 10px',
                  borderRadius: '20px', border: '1px solid #3b82f6'
                }}>
                  ACTIVA
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Perfil;