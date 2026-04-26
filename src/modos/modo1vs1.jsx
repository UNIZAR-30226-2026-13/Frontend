//import React from 'react';
//import { useEffect, useState } from 'react';
//import io from 'socket.io-client'; // Asumo que utilizamos socket.io en backend para las salas
//import { BARCOS, TABLEROS, ESTADOS_CASILLAS, POWER_UPS } from '../constants/configuracion'; 
//import { generarTabVacio } from './modoIA'
import React, { useEffect, useState } from 'react';
import socketService from '../api/socketService';
import { BARCOS, TABLEROS, ESTADOS_CASILLAS } from '../constants/configuracion'; 
import Tablero from '../components/tablero';
import Barcos from '../components/barcos';

const TAM = TABLEROS.ESTANDAR_TAM;

const generarTabVacio = () => {
  return Array(TAM).fill(null).map(() => Array(TAM).fill(ESTADOS_CASILLAS.VACIO));
};

function Modo1vs1({ salaId, alSalir }) {
  //const [mios, setMios] = useState(generarTabVacio());
  //const [enemigos, setEnemigos] = useState(generarTabVacio());
  //const [miTurno, setMiTurno] = useState(false);
  //const [idRival, setIdRival] = useState(null);

  //Estados de conexion y turnos
  const [fase, setFase] = useState('ESPERANDO_RIVAL');
  const [miTurno, setMiTurno] = useState(false);
  const [idRival, setIdRival] = useState(null);

  //tableros
  const [mios, setMios] = useState(generarTabVacio());
  const [enemigos, setEnemigos] = useState(generarTabVacio());

  //fase de colocacion
  const [barcoSeleccionado, setBarcoSeleccionado] = useState(null);
  const [orientacion, setOrientacion] = useState('H');
  const [barcosColocados, setBarcosColocados] = useState([]);
  const [celdasSombra, setCeldasSombra] = useState([]);

  //calculo si ya se han puesto todos los barcos
  const totalBarcos = Object.values(BARCOS).reduce((acc, b) => acc + b.cantidad, 0);
  const todosColocados = barcosColocados.length === totalBarcos;

  useEffect(() => {
    socketService.conectar();
    socketService.unirsePartida(salaId);

    /*socket.on('partida_lista', ({ jugadores, turnoDe }) => {
      const rival = jugadores.find(id => id !== socket.id);
      setIdRival(rival);
      setMiTurno(turnoDe === socket.id);
      alert("¡Partida encontrada!");
    });*/
    socketService.onPartidaLista(({ jugadores, turnoDe }) => {
      const rival = jugadores.find(id => id !== socketService.getId());
      setIdRival(rival);
      setMiTurno(turnoDe === socketService.getId());
      setFase('COLOCANDO'); 
    });

    // Me dispara el rival
    /*socket.on('recibir_disparo', ({ f, c }) => {
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
    });*/
    socketService.onRecibirDisparo(({ f, c }) => {
      setMios(prevMios => {
        const nuevoMios = prevMios.map(fila => [...fila]);
        const esBarco = nuevoMios[f][c] === ESTADOS_CASILLAS.BARCO;
        const resultado = esBarco ? ESTADOS_CASILLAS.TOCADO : ESTADOS_CASILLAS.AGUA;
        
        nuevoMios[f][c] = resultado;

        socketService.enviarResultadoDisparo({ 
          salaId, f, c, resultado, sigueTurno: esBarco 
        });

        if (!esBarco) setMiTurno(true);
        return nuevoMios;
      });
    });

    // Espero a que el servidor me diga el resultado de mi disparo
    /*socket.on('actualizar_tableros', ({ f, c, resultado, sigueTurno }) => {
      setEnemigos(prev => {
        const nuevo = [...prev];
        nuevo[f][c] = resultado; // Actualizamos el tablero de enemigos
        return nuevo;
      });
      
      // Actualizar turno según lo que diga el servidor
      setMiTurno(socket.id === (sigueTurno ? socket.id : idRival));
    });*/
    socketService.onActualizarTableros(({ f, c, resultado, sigueTurno }) => {
      setEnemigos(prevEnemigos => {
        const nuevo = prevEnemigos.map(fila => [...fila]);
        nuevo[f][c] = resultado;
        return nuevo;
      });
      
      setMiTurno(socketService.getId() === (sigueTurno ? socketService.getId() : idRival));
    });

    //servidor avisa de que el rival ha terminado de colocar sus barcos y que ya se puede empezar a jugar
    socketService.onRivalListo(() => {
       //depende de backend
    });

    //evento imaginario para empezar a jugar, depende de que backend lo emita cuando ambos hayan colocado sus barcos
    socketService.socket?.on('comenzar_batalla', () => {
        setFase('JUGANDO');
    });

    return () => {
      socketService.desconectar();
    };
  }, [salaId]);

  //logca de colocacion
  //hover para mostrar donde se colocaria el barco
  const manejarHover = (f, c) => {
    if (fase !== 'COLOCANDO' || !barcoSeleccionado) {
      setCeldasSombra([]);
      return;
    }

    const nuevasCeldas = [];
    for (let i = 0; i < barcoSeleccionado.tam; i++) {
      const filaD = orientacion === 'V' ? f + i : f;
      const colD = orientacion === 'H' ? c + i : c;

      if (filaD < TAM && colD < TAM) {
        nuevasCeldas.push(`${filaD}-${colD}`);
      }
    }
    setCeldasSombra(nuevasCeldas);
  };

  //click para colocar el barco
  const colocarBarco = (f, c) => {
    if (!barcoSeleccionado || fase !== 'COLOCANDO') return;

    const nuevoTablero = mios.map(fila => [...fila]);
    const celdasAOCupar = [];

    for (let i = 0; i < barcoSeleccionado.tam; i++) {
      const filaD = orientacion === 'V' ? f + i : f;
      const colD = orientacion === 'H' ? c + i : c;

      if (filaD >= TAM || colD >= TAM) {
        alert("¡El barco se sale del tablero!");
        return;
      }
      if (nuevoTablero[filaD][colD] !== ESTADOS_CASILLAS.VACIO) {
        alert("Casilla ocupada, elige otra posición.");
        return;
      }
      celdasAOCupar.push([filaD, colD]);
    }

    celdasAOCupar.forEach(([fd, cd]) => {
      nuevoTablero[fd][cd] = ESTADOS_CASILLAS.BARCO;
    });

    setMios(nuevoTablero);
    setBarcosColocados([...barcosColocados, barcoSeleccionado]);
    setBarcoSeleccionado(null); 
    setCeldasSombra([]); 
  };

  const confirmarTablero = () => {
    setFase('ESPERANDO_LISTO_RIVAL');
    socketService.enviarTablero(salaId, mios);
  };

  //logica de jugo
  const dispararMultijugador = (f, c) => {
    if (!miTurno || enemigos[f][c] !== ESTADOS_CASILLAS.VACIO || fase !== 'JUGANDO') return;
    socketService.disparar(salaId, f, c);
  };

  /*return (
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
  );*/

  return (
    <div style={{ 
      background: '#1a1a1a', 
      color: 'white', 
      width: '100vw', 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      overflow: 'hidden' 
    }}>
      <header style={{ 
        padding: '10px 20px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        borderBottom: '1px solid #333'
      }}>
        <button onClick={alSalir} style={{
          background: '#ef4444', 
          color: 'white', 
          border: 'none', 
          padding: '8px 15px', 
          borderRadius: '5px', 
          cursor: 'pointer'
        }}>
          ← Salir al Menú
        </button>
        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>
          {fase === 'ESPERANDO_RIVAL' && "SALA: " + salaId}
          {fase === 'COLOCANDO' && "CONFIGURACIÓN DE FLOTA"}
          {fase === 'ESPERANDO_LISTO_RIVAL' && "ESPERANDO AL RIVAL..."}
          {fase === 'JUGANDO' && (miTurno ? "TU TURNO" : "TURNO ENEMIGO...")}
        </h2>
        <div style={{ width: '130px' }}></div> 
      </header>

      <main style={{ 
        display: 'flex', 
        flex: 1, 
        overflow: 'hidden' }}>
        
        {fase === 'COLOCANDO' && (
          <>
            <aside style={{ 
              width: '300px', 
              background: '#222', 
              padding: '20px', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between', 
              borderRight: '1px solid #333'
            }}>
              <Barcos 
                barcoSeleccionado={barcoSeleccionado}
                alSeleccionar={setBarcoSeleccionado}
                barcosColocados={barcosColocados}
                orientacion={orientacion}
                alCambiarOrientacion={() => {
                  setOrientacion(orientacion === 'H' ? 'V' : 'H');
                  setCeldasSombra([]);
                }}
              />

              {todosColocados && (
                <button onClick={confirmarTablero} style={{ 
                  marginTop: '20px', 
                  padding: '15px', 
                  fontSize: '16px', 
                  cursor: 'pointer',
                  background: '#10b981', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  fontWeight: 'bold'
                }}>
                  CONFIRMAR FLOTA
                </button>
              )}
            </aside>
            <section style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center' }}>
              <h4 style={{ 
                margin: '0 0 10px 0', 
                color: '#aaa' 
                }}>POSICIONA TUS NAVES</h4>
              <Tablero 
                cuadricula={mios} 
                alDisparar={colocarBarco} 
                esIA={false} 
                celdasSombra={celdasSombra}
                alEntrarCelda={manejarHover}
                alSalirTablero={() => setCeldasSombra([])}
              />
            </section>
          </>
        )}

        {(fase === 'ESPERANDO_RIVAL' || fase === 'ESPERANDO_LISTO_RIVAL') && (
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' }}>
            <h2 style={{ 
              color: '#3b82f6', 
              animation: 'pulse 2s infinite' }}>
               {fase === 'ESPERANDO_RIVAL' ? 'Buscando almirante enemigo...' : 'El rival está posicionando su flota...'}
            </h2>
          </div>
        )}

        {fase === 'JUGANDO' && (
          <section style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '50px', 
            padding: '20px'
          }}>
            <div style={{ 
              textAlign: 'center', 
              opacity: miTurno ? 0.7 : 1, 
              transform: miTurno ? 'scale(0.95)' : 'scale(1)', 
              transition: 'all 0.3s' }}>
              <h4 style={{ 
                margin: '0 0 10px 0', 
                color: '#aaa' }}>TU FLOTA</h4>
              <Tablero cuadricula={mios} esIA={false} />
            </div>

            <div style={{ 
              textAlign: 'center', 
              boxShadow: miTurno ? '0 0 20px #3b82f6' : 'none', 
              borderRadius: '8px', 
              transform: miTurno ? 'scale(1.05)' : 'scale(1)', 
              transition: 'all 0.3s' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#3b82f6' }}>OCÉANO ENEMIGO</h4>
              <Tablero cuadricula={enemigos} alDisparar={dispararMultijugador} esIA={true} />
            </div>
          </section>
        )}

      </main>
    </div>
  );
}

export default Modo1vs1;