import React, { useState, useEffect } from 'react';
import { ESTADOS_CASILLAS, BARCOS } from '../constants/configuracion';
import Celda from '../components/celda';
import socketService from '../api/socketService';

function JuegoPrivada({ alSalir, configuracion }) {
  const [fasePartida, setFasePartida] = useState('ESPERANDO'); //ESPERANDO
  const [codigoSala, setCodigoSala] = useState(configuracion?.codigoSala || 'X7K9A');

  const { tamano, numeroBarcos } = configuracion || {};

  const [tableroMio, setTableroMio] = useState([]);
  const [tableroEnemigo, setTableroEnemigo] = useState([]);
  const [turnoMio, setTurnoMio] = useState(true);
  const [cargando, setCargando] = useState(true);

  const [errorFatal, setErrorFatal] = useState(null); //estado para capturar colapsos


  useEffect(() => {
    //encendemos comunicaciones y nos unimos a la sala
    socketService.conectar();
    socketService.unirsePartida(codigoSala);

    //conexion del rival
    socketService.onPartidaLista(() => {
       console.log("¡Rival detectado en el radar! Posiciones de combate.");
       prepararPartida();
       setFasePartida('JUGANDO');
    });

    //disparos entrantes
    socketService.onRecibirDisparo((datos) => {
       //el backend nos enviara las coordenadas f y c
       const { f, c } = datos;
       console.log(`¡Alerta! Misil enemigo detectado en las coordenadas [${f}, ${c}]`);

       setTableroMio((tableroActual) => {
          const nuevoTablero = tableroActual.map(fila => [...fila]);
          const estadoCasilla = nuevoTablero[f][c];

          let resultadoImpacto = ESTADOS_CASILLAS.AGUA;

          if (estadoCasilla === ESTADOS_CASILLAS.BARCO) {
            nuevoTablero[f][c] = ESTADOS_CASILLAS.TOCADO;
            resultadoImpacto = ESTADOS_CASILLAS.TOCADO;
            console.log("¡Nos han dado!");
          } else if (estadoCasilla === ESTADOS_CASILLAS.VACIO) {
            nuevoTablero[f][c] = ESTADOS_CASILLAS.AGUA;
            console.log("Impacto en el agua.");
          }

          //le decimos al backend si nos ha dado o ha sido agua para que actualice su pantalla
          socketService.enviarResultadoDisparo({ 
            salaId: codigoSala, 
            f: f, 
            c: c, 
            resultado: resultadoImpacto 
          });

          return nuevoTablero;
       });

       setTurnoMio(true);
    });

    return () => {
       //si creamos metodo para abandonar sala iria aquí
       socketService.socket.off('partida_lista');
       socketService.socket.off('recibir_disparo');
    };
  }, [codigoSala]);

  /*useEffect(() => {
    prepararPartida();
  }, [configuracion]);*/

  /*const prepararPartida = () => {
    //crea tableros vacios
    let nuevoMio = Array(tamano).fill(null).map(() => Array(tamano).fill(ESTADOS_CASILLAS.VACIO));
    let nuevoEnemigo = Array(tamano).fill(null).map(() => Array(tamano).fill(ESTADOS_CASILLAS.VACIO));

    //lista barcos
    const listaTamanos = [];
    Object.entries(numeroBarcos).forEach(([id, cantidad]) => {
      for (let i = 0; i < cantidad; i++) {
        listaTamanos.push(BARCOS[id].tam);
      }
    });

    nuevoMio = colocarBarcosAleatorios(nuevoMio, [...listaTamanos]);
    nuevoEnemigo = colocarBarcosAleatorios(nuevoEnemigo, [...listaTamanos]);

    setTableroMio(nuevoMio);
    setTableroEnemigo(nuevoEnemigo);
    setCargando(false);
  };*/

  /*const prepararPartida = () => {
      try {
        //si faltan datos lanzamos un error
        if (!tamano || !numeroBarcos) {
          throw new Error("Faltan datos vitales en la configuración de la partida.");
        }

        let nuevoMio = Array(tamano).fill(null).map(() => Array(tamano).fill(ESTADOS_CASILLAS.VACIO));
        //let nuevoEnemigo = Array(tamano).fill(null).map(() => Array(tamano).fill(ESTADOS_CASILLAS.VACIO));

        const listaTamanos = [];
        Object.entries(numeroBarcos).forEach(([id, cantidad]) => {
          //comprobamos que el barco existe en las constantes
          if (!BARCOS[id]) throw new Error(`El barco '${id}' no existe en la base de datos.`);
          for (let i = 0; i < cantidad; i++) {
            listaTamanos.push(BARCOS[id].tam);
          }
        });

        nuevoMio = colocarBarcosAleatorios(nuevoMio, [...listaTamanos]);
        //nuevoEnemigo = colocarBarcosAleatorios(nuevoEnemigo, [...listaTamanos]);

        setTableroMio(nuevoMio);
        //setTableroEnemigo(nuevoEnemigo);
        setCargando(false);
        
      } catch (error) { //atrapamos error
        console.error("Fallo del Sistema:", error);
        setErrorFatal(error.message);
        setCargando(false);
      }
    };*/

    //prepararPartida momentanea sin backend, para MOCK
    const prepararPartida = () => {
    try {
      if (!tamano) throw new Error("Falta el tamaño del tablero.");

      let nuevoMio = Array(tamano).fill(null).map(() => Array(tamano).fill(ESTADOS_CASILLAS.VACIO));
      let nuevoEnemigo = Array(tamano).fill(null).map(() => Array(tamano).fill(ESTADOS_CASILLAS.VACIO));

      const listaTamanos = [];
      
      let usarFlotaEmergencia = false;
      if (!numeroBarcos) {
          usarFlotaEmergencia = true;
      } else {
          Object.keys(numeroBarcos).forEach(id => {
              if (!BARCOS[id]) usarFlotaEmergencia = true;
          });
      }

      if (usarFlotaEmergencia) {
          console.warn("Coordenadas del menú corruptas. Desplegando flota de emergencia...");
          Object.keys(BARCOS).forEach(idValido => {
              listaTamanos.push(BARCOS[idValido].tam);
          });
      } else {
          Object.entries(numeroBarcos).forEach(([id, cantidad]) => {
            for (let i = 0; i < cantidad; i++) {
              listaTamanos.push(BARCOS[id].tam);
            }
          });
      }

      nuevoMio = colocarBarcosAleatorios(nuevoMio, [...listaTamanos]);
      nuevoEnemigo = colocarBarcosAleatorios(nuevoEnemigo, [...listaTamanos]);

      setTableroMio(nuevoMio);
      setTableroEnemigo(nuevoEnemigo);
      setCargando(false);
      
    } catch (error) {
      console.error("Fallo del Sistema:", error);
      setErrorFatal(error.message);
      setCargando(false);
    }
  };

  //funcion colocacion
  const colocarBarcosAleatorios = (tablero, tamanos) => {
    const copiaTablero = tablero.map(f => [...f]);
    
    tamanos.forEach(tam => {
      let colocado = false;
      let intentos = 0; //contador de intentos
      while (!colocado && intentos < 1000) {
        const vertical = Math.random() > 0.5;
        const fila = Math.floor(Math.random() * tamano);
        const col = Math.floor(Math.random() * tamano);

        if (puedoColocar(copiaTablero, fila, col, tam, vertical)) {
          for (let i = 0; i < tam; i++) {
            const f = vertical ? fila + i : fila;
            const c = vertical ? col : col + i;
            copiaTablero[f][c] = ESTADOS_CASILLAS.BARCO;
          }
          colocado = true;
        }
        intentos++;
      }
      if (!colocado) throw new Error("¡El tablero es demasiado pequeño para tantos barcos!");
    });
    return copiaTablero;
  };

  const puedoColocar = (tablero, f, c, tam, vert) => {
    for (let i = 0; i < tam; i++) {
      const nf = vert ? f + i : f;
      const nc = vert ? c : c + i;
      if (nf >= tamano || nc >= tamano || tablero[nf][nc] !== ESTADOS_CASILLAS.VACIO) return false;
    }
    return true;
  };

  //logica disparo
  const disparar = (f, c) => {
    if (!turnoMio || tableroEnemigo[f][c] > 1) return;

    socketService.disparar(codigoSala, f, c); //enviamos disparo al servidor

    const nuevo = tableroEnemigo.map(fila => [...fila]);
    
    if (nuevo[f][c] === ESTADOS_CASILLAS.BARCO) {
      nuevo[f][c] = ESTADOS_CASILLAS.TOCADO;
    } else {
      nuevo[f][c] = ESTADOS_CASILLAS.AGUA;
      setTurnoMio(false);
    }
    setTableroEnemigo(nuevo);
  };

  //MOCK para simular que el backend nos manda un disparo
  const simularAtaqueEnemigo = () => {
    //coordenadas aleatorias
    const f = Math.floor(Math.random() * tamano);
    const c = Math.floor(Math.random() * tamano);

    console.log(`[SIMULACRO] Misil enemigo entrante en [${f}, ${c}]`);

    setTableroMio((tableroActual) => {
      const nuevoTablero = tableroActual.map(fila => [...fila]);
      const estadoCasilla = nuevoTablero[f][c];

      if (estadoCasilla === ESTADOS_CASILLAS.BARCO) {
        nuevoTablero[f][c] = ESTADOS_CASILLAS.TOCADO;
      } else if (estadoCasilla === ESTADOS_CASILLAS.VACIO) {
        nuevoTablero[f][c] = ESTADOS_CASILLAS.AGUA;
      }
      return nuevoTablero;
    });

    // Nos devuelve el turno
    setTurnoMio(true);
  };

  if (errorFatal) {
      return (
        <div style={{ padding: '40px', color: '#ef4444', textAlign: 'center' }}>
          <h2>FALLO CRÍTICO</h2>
          <p>{errorFatal}</p>
          <button onClick={alSalir} style={estiloBotonSalir}>VOLVER AL MENÚ</button>
        </div>
      );
    }

    //sala de espera
    if (fasePartida === 'ESPERANDO') {
      return (
        <div style={{ padding: '40px', color: 'white', textAlign: 'center', background: '#1a1a1a', height: '100vh' }}>
          <button onClick={alSalir} style={estiloBotonSalir}>← ABORTAR MISIÓN</button>
          
          <h2 style={{ fontSize: '2rem', color: '#3b82f6' }}>SALA DE TRANSMISIÓN</h2>
          <p style={{ fontSize: '1.2rem', marginTop: '20px' }}>Pásale este código de acceso a tu almirante rival:</p>
          
          <div style={{ 
            fontSize: '4rem', 
            letterSpacing: '15px', 
            background: '#222', 
            padding: '20px 40px', 
            margin: '30px auto', 
            width: 'fit-content',
            borderRadius: '10px',
            border: '2px dashed #10b981',
            fontWeight: 'bold'
          }}>
            {codigoSala}
          </div>
          
          <p style={{ color: '#aaa', fontSize: '1.1rem' }}>Esperando conexión enemiga...</p>
          
          
          <button 
            onClick={() => {
              prepararPartida(); 
              setFasePartida('JUGANDO');
            }}
            style={{ marginTop: '50px', padding: '15px 30px', background: '#10b981', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            [MOCK] Simular que el rival se conectó
          </button>
        </div>
      );
    }

  if (cargando) return <div style={{color: 'white'}}>Cargando flota...</div>;

  return (
    <div style={{ padding: '20px', color: 'white', textAlign: 'center' }}>
      <button onClick={alSalir} style={estiloBotonSalir}>← ABORTAR</button>
      
      <h2>MODO PRIVADO: {tamano}x{tamano}</h2>
      <p>{turnoMio ? "TU TURNO" : "TURNO ENEMIGO"}</p>

      <div style={{ display: 'flex', gap: '50px', justifyContent: 'center', marginTop: '20px' }}>
    
        <div>
          <h3>Tu Flota</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${tamano}, 30px)`, //para que quepan las celdas
            gap: '2px' 
          }}>
            {tableroMio.map((fila, f) => fila.map((celda, c) => (
              <Celda key={`m-${f}-${c}`} valor={celda} esIA={false} />
            )))}
          </div>
        </div>

    
        <div>
          <h3>Océano Enemigo</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${tamano}, 30px)`, 
            gap: '2px' 
          }}>
            {tableroEnemigo.map((fila, f) => fila.map((celda, c) => (
              <Celda 
                key={`e-${f}-${c}`} 
                valor={celda} 
                esIA={true} 
                alClickar={() => disparar(f, c)} 
              />
            )))}
          </div>
        </div>

        {/* boton MOCK solo para pruebas sin backend */}
        {!turnoMio && (
          <div style={{ marginTop: '40px' }}>
            <button 
              onClick={simularAtaqueEnemigo}
              style={{ padding: '15px 30px', background: '#eab308', color: 'black', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              [MOCK] Forzar respuesta enemiga
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

const estiloBotonSalir = {
  position: 'absolute', top: '20px', left: '20px', background: '#ef4444', 
  color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer'
};

export default JuegoPrivada;