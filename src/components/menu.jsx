import React from 'react';
import IconoDefault from '../assets/IconoDefault.png'
import { useState, useEffect } from 'react';
import apiService from '../api/apiService';
import socketService from '../api/socketService';
import azteca from '../assets/perfilAzteca.png'
import calavera from '../assets/perfilCalavera.png'
import casco from '../assets/perfilCasco.png'
import dragon from '../assets/perfilDragon.png'
import espectro from '../assets/perfilFantasma.png'
 
const FOTOS_PERFIL = {
  default:  IconoDefault,
  azteca:   azteca,
  calavera: calavera,
  casco:    casco,
  dragon:   dragon,
  espectro: espectro,
};

function Menu({ alElegir, usuario }) {

  const [imgFoto, setImgFoto] = useState(() => {
    const id = usuario?.perfil || 'default';
    return FOTOS_PERFIL[id] || IconoDefault;
  });
 
  //actualiza foto cuando vuelves al menu
  useEffect(() => {
    const id = usuario?.perfil || 'default';
    setImgFoto(FOTOS_PERFIL[id] || IconoDefault);
  }, []);

  const [buscando, setBuscando] = useState(false);
  const [menuPrivadaActivo, setMenuPrivadaActivo] = useState(false);
  const [codigoSalaEntrada, setCodigoSalaEntrada] = useState('');
  useEffect(() => {
    socketService.conectar(); //conexion socket
    socketService.unirseSalaPrivada();  //unirse a sala personal
    //listener para encontrar partida online
    socketService.onPartidaEncontrada((datos) => {
        console.log("¡Rival detectado en el radar! Partida ID:", datos.partidaID);
        //aqui diremos a App.jsx que cambie a la pantalla de COLOCAR_BARCOS
        //alElegir('COLOCAR_BARCOS_ONLINE', datos.partidaID); 
        setBuscando(false);
    });

    //apagamos listener
    return () => {
        socketService.socket?.off('partidaEncontrada');
    };
  }, []);

  const iniciarBusqueda = async () => {
    setBuscando(true);
    try {
        const nombreJugador = usuario?.user || usuario?.username; 
        const res = await apiService.buscarPartida(nombreJugador);
        
        if (res.status === "InQueue") {
            console.log("Desplegado en la zona de espera. Aguardando rival...");
        } else if (res.status === "Encontrada") {
            console.log("¡Rival encontrado instantáneamente!");
            //setBuscando(false);
            //alElegir('COLOCAR_BARCOS_ONLINE', res.partidaID);
        }
    } catch (error) {
        console.error("Fallo de comunicaciones al buscar partida:", error);
        setBuscando(false);
    }
  };

  const manejarCrearPrivada = () => {
    alElegir('PRIVADA'); 
  };

  const manejarUnirsePrivada = async () => {
    if (!codigoSalaEntrada) return alert("Introduce un código.");
    
    try {
      const res = await apiService.unirsePartidaPrivada(codigoSalaEntrada.trim());
      
      if (res.ok) {
          const data = await res.json(); 
          console.log("📡 DATOS RECIBIDOS DEL BACKEND:", data);

          const s = data.settings?.gameSettings || data.settings || {};       

          const configReal = {
              codigoSala: codigoSalaEntrada.trim(),
              tamano: s.board_size || s.size || 10,
              numeroBarcos: {
                  FRA: s.two_count || (s.boats && s.boats[0]) || 1,
                  SUB: s.three_count || (s.boats && s.boats[1]) || 1,
                  ACO: s.four_count || (s.boats && s.boats[2]) || 1,
                  POR: s.five_count || (s.boats && s.boats[3]) || 1
              },
              esInvitado: true
          };

          console.log("✅ MOCHILA FINAL DEL INVITADO:", configReal);
          alElegir('JUGAR_PRIVADA', configReal);

          alElegir('JUGAR_PRIVADA', configReal);
          
      } else {
          const errorMsg = await res.json();
          alert(`Acceso Denegado: ${errorMsg.message}`);
      }
    } catch (error) {
      console.error("Error en el acceso:", error);
    }
  };

  return (
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

      {/* Botón de perfil arriba a la derecha */}
      <div
        onClick={() => alElegir('PERFIL')}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          background: '#333',
          border: '2px solid #555',
          borderRadius: '10px',
          padding: '16px',
        }}
      >
        <div style={{
          width: '50px', 
          height: '50px', 
          borderRadius: '50%',
          background: '#555', 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center', 
          fontSize: '18px',
          overflow: 'hidden'
        }}>
          <img 
            src={imgFoto} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          /> {/*foto aqui*/}       
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{usuario?.username || 'Jugador'}</span>
          <span style={{ fontSize: '12px', color: '#ffffff' }}>ELO: {usuario?.elo ?? 0}</span>
        </div>
      </div>


      <h1 style={{ fontSize: '50px', color: '#ffffff', marginBottom: '60px' }}>HUNDE LA FLOTA</h1>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '50px'
      }}>
        
          {!menuPrivadaActivo ? (
            <>
                <button onClick={() => alElegir('1VS1')} style={botonHeroStyle}>1 VS 1</button>
                <div style={{ display: 'flex', gap: '30px' }}>
                    <button onClick={() => alElegir('IA')} style={botonStyle}>JUGAR VS IA</button>
                    <button onClick={() => setMenuPrivadaActivo(true)} style={botonStyle}>PARTIDA PRIVADA</button>
                </div>
            </>
        ) : (
            <div style={{ 
                background: '#222', padding: '40px', borderRadius: '15px', border: '2px solid #555',
                display: 'flex', flexDirection: 'column', gap: '20px', width: '400px', textAlign: 'center'
            }}>
                <h2 style={{ margin: 0, color: '#3b82f6' }}>ZONA RESTRINGIDA</h2>
                
                <button onClick={manejarCrearPrivada} style={{...botonStyle, width: '100%', background: '#10b981', borderColor: '#059669'}}>
                    CREAR SALA NUEVA
                </button>
                
                <div style={{ color: '#888', fontWeight: 'bold' }}>--- O ---</div>
                
                <input 
                    type="text" 
                    placeholder="INTRODUCIR CÓDIGO" 
                    value={codigoSalaEntrada}
                    onChange={(e) => setCodigoSalaEntrada(e.target.value.toUpperCase())}
                    style={{
                        padding: '15px', fontSize: '20px', textAlign: 'center', borderRadius: '5px',
                        border: '2px solid #555', background: '#111', color: '#fff', textTransform: 'uppercase', letterSpacing: '5px'
                    }}
                />
                
                <button onClick={manejarUnirsePrivada} style={{...botonStyle, width: '100%', background: '#3b82f6', borderColor: '#2563eb'}}>
                    UNIRSE A SALA
                </button>

                <button onClick={() => setMenuPrivadaActivo(false)} style={{...botonStyle, width: '100%', marginTop: '20px', padding: '10px', fontSize: '16px'}}>
                    ← Volver
                </button>
            </div>
        )}
      </div>
    </div>
  );
}

const botonStyle = {
  padding: '15px 40px',
  fontSize: '20px',
  fontWeight: 'bold',
  background: '#333',
  color: 'white',
  border: '2px solid #555',
  borderRadius: '10px',
  cursor: 'pointer',
  width: '300px',
  transition: 'all 0.3s'
};

const botonHeroStyle = {
  padding: '25px 40px',
  fontSize: '26px',
  fontWeight: 'bold',
  background: '#3b82f6',
  color: 'white',
  border: '2px solid #60a5fa',
  borderRadius: '10px',
  cursor: 'pointer',
  width: '630px', 
  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
  transition: 'all 0.3s'
};

export default Menu;