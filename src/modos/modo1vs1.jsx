import React from 'react';
import { useEffect, useState } from 'react';
import io from 'socket.io-client'; // Asumo que utilizamos socket.io en backend para las salas
import { BARCOS, TABLEROS, ESTADOS_CASILLAS, POWER_UPS } from '../constants/configuracion'; 
import { generarTabVacio } from './modoIA'

function Modo1vs1({ salaId, alSalir }) {
  const [mios, setMios] = useState(generarTabVacio());
  const [enemigos, setEnemigos] = useState(generarTabVacio());
  const [miTurno, setMiTurno] = useState(false);
  const [idRival, setIdRival] = useState(null);

  useEffect(() => {
    const socket = io("http://localhost:3000");
    socket.emit('unirse_partida', salaId);

    socket.on('partida_lista', ({ jugadores, turnoDe }) => {
      const rival = jugadores.find(id => id !== socket.id);
      setIdRival(rival);
      setMiTurno(turnoDe === socket.id);
      alert("¡Partida encontrada!");
    });

    // Me dispara el rival
    socket.on('recibir_disparo', ({ f, c }) => {
      const esBarco = mios[f][c] === ESTADOS_CASILLAS.BARCO;
      const resultado = esBarco ? ESTADOS_CASILLAS.TOCADO : ESTADOS_CASILLAS.AGUA;
      
      // Actualizo mi tablero local
      const nuevoMios = [...mios];
      nuevoMios[f][c] = resultado;
      setMios(nuevoMios);

      // Le digo al servidor qué pasó para que se lo diga al rival
      socket.emit('resultado_disparo', { 
        salaId, f, c, resultado, 
        sigueTurno: !esBarco // Si falló, es mi turno
      });
      
      if (!esBarco) setMiTurno(true);
    });

    // Espero a que el servidor me diga el resultado de mi disparo
    socket.on('actualizar_tableros', ({ f, c, resultado, sigueTurno }) => {
      setEnemigos(prev => {
        const nuevo = [...prev];
        nuevo[f][c] = resultado; // Actualizamos el tablero de enemigos
        return nuevo;
      });
      
      // Actualizar turno según lo que diga el servidor
      setMiTurno(socket.id === (sigueTurno ? socket.id : idRival));
    });

    return () => socket.off();
  }, [mios, salaId]);

  const dispararMultijugador = (f, c) => {
    if (!miTurno || enemigos[f][c] !== ESTADOS_CASILLAS.VACIO) return;
    socket.emit('realizar_disparo', { salaId, f, c });
  };

  return (
    <div style={{ 
      textAlign: 'center',
      background: '#1a1a1a', 
      color: 'white',
      width: '100vw',        
      height: '100vh',    
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div>
          <h2>{miTurno ? "Tu turno" : "Turno del rival"}</h2>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Tablero cuadricula={mios} esIA={false} />
            <Tablero cuadricula={enemigos} alDisparar={dispararMultijugador} esIA={true} />
          </div>
        </div>
        <button 
          onClick={alSalir} 
          style={{
            background: '#ef4444', 
            color: 'white', 
            border: 'none', 
            padding: '10px 20px', 
            borderRadius: '5px', 
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ← Salir al Menú
        </button>
        
        <h1 style={{ margin: 0 }}>1 VS 1</h1>
        <div style={{ width: '100px' }}></div> 
      </div>
    </div>
  );
}

export default Modo1vs1;