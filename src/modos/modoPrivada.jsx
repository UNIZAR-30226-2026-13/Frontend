import React, { useState, useEffect } from 'react';
import { ESTADOS_CASILLAS, BARCOS } from '../constants/configuracion';
import Celda from '../components/celda';
import socketService from '../api/socketService';
import Tablero from '../components/tablero';
import Barcos from '../components/barcos';

function JuegoPrivada({ alSalir, configuracion }) {
  const [fasePartida, setFasePartida] = useState('ESPERANDO'); //ESPERANDO
  const [codigoSala, setCodigoSala] = useState(configuracion?.codigoSala || 'X7K9A');

  const { tamano, numeroBarcos } = configuracion || {};

  const [tableroMio, setTableroMio] = useState([]);
  const [tableroEnemigo, setTableroEnemigo] = useState([]);
  const [turnoMio, setTurnoMio] = useState(true);
  const [cargando, setCargando] = useState(true);

  const [errorFatal, setErrorFatal] = useState(null); //estado para capturar colapsos

  //estados colocacion
  const [barcoSeleccionado, setBarcoSeleccionado] = useState(null);
  const [orientacion, setOrientacion] = useState('H');
  const [barcosColocados, setBarcosColocados] = useState([]);
  const [celdasSombra, setCeldasSombra] = useState([]);


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
       let impactoEnBarco = false;
       let resultadoImpacto = ESTADOS_CASILLAS.AGUA;

       setTableroMio((tableroActual) => {
          const nuevoTablero = tableroActual.map(fila => [...fila]);
          const caldaAtacada = nuevoTablero[f][c];
          const tipo = celdaAtacada?.tipo ?? celdaAtacada;

          let resultadoImpacto = ESTADOS_CASILLAS.AGUA;

          if (tipo === ESTADOS_CASILLAS.BARCO) {
            impactoEnBarco = true;
            resultadoImpacto = ESTADOS_CASILLAS.TOCADO;
            nuevoTablero[f][c] = typeof celdaAtacada === 'object' ? { ...celdaAtacada, tipo: ESTADOS_CASILLAS.TOCADO } : ESTADOS_CASILLAS.TOCADO;
            const celdasDelBarco = obtenerCeldasBarcoCompleto(nuevoTablero, f, c);
            const estaHundido = celdasDelBarco.every(([bf, bc]) => {
              const t = nuevoTablero[bf][bc]?.tipo ?? nuevoTablero[bf][bc];
              return t === ESTADOS_CASILLAS.TOCADO || t === ESTADOS_CASILLAS.HUNDIDO;
            }); 

            if (estaHundido) {
              resultadoImpacto = ESTADOS_CASILLAS.HUNDIDO;
              celdasDelBarco.forEach(([bf, bc]) => {
                const c_obj = nuevoTablero[bf][bc];
                nuevoTablero[bf][bc] = typeof c_obj === 'object' 
                  ? { ...c_obj, tipo: ESTADOS_CASILLAS.HUNDIDO } 
                  : ESTADOS_CASILLAS.HUNDIDO;
              });
            }
          } else if (tipo === ESTADOS_CASILLAS.VACIO) {
            nuevoTablero[f][c] = ESTADOS_CASILLAS.AGUA;
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

       setTimeout(() => {
         if (!impactoEnBarco) setTurnoMio(true);
       }, 0);
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

      const generarVacio = () => Array(tamano).fill(null).map(() => Array(tamano).fill(ESTADOS_CASILLAS.VACIO));
      let nuevoMio = generarVacio();
      let nuevoEnemigo = generarVacio();

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

      //nuevoMio = colocarBarcosAleatorios(nuevoMio, [...listaTamanos]);
      nuevoEnemigo = colocarBarcosAleatorios(nuevoEnemigo, [...listaTamanos], numeroBarcos || BARCOS);

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
  const colocarBarcosAleatorios = (tablero, tamanos, numeroBarcosConfig) => {
    const copiaTablero = tablero.map(f => [...f]);
    const configBarcosArr = Object.entries(numeroBarcosConfig || BARCOS);

    tamanos.forEach(tam => {
      let colocado = false;
      let intentos = 0; //contador de intentos

      const entryBarco = configBarcosArr.find(([id, conf]) => conf.tam === tam);
      const barcoId = entryBarco ? entryBarco[0] : 'unknown';

      while (!colocado && intentos < 1000) {
        const vertical = Math.random() > 0.5;
        const orientacion = vertical ? 'V' : 'H';
        const fila = Math.floor(Math.random() * tamano);
        const col = Math.floor(Math.random() * tamano);

        if (puedoColocar(copiaTablero, fila, col, tam, vertical)) {
          for (let i = 0; i < tam; i++) {
            const f = vertical ? fila + i : fila;
            const c = vertical ? col : col + i;
            copiaTablero[f][c] = {
                tipo: ESTADOS_CASILLAS.BARCO,
                barcoId: barcoId,
                orientacion: orientacion,
                indice: i,
                total: tam
            };
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

  //sombra al colocar barco
  const manejarHover = (f, c) => {
    if (fasePartida !== 'COLOCANDO' || !barcoSeleccionado) return;
    let nuevasCeldas = [];
    for (let i = 0; i < barcoSeleccionado.tam; i++) {
      const filaD = orientacion === 'V' ? f + i : f;
      const colD = orientacion === 'H' ? c + i : c;
      if (filaD < tamano && colD < tamano) {
        nuevasCeldas.push(`${filaD}-${colD}`);
      } 
    }
    setCeldasSombra(nuevasCeldas);
  };

  const obtenerCeldasBarcoCompleto = (tablero, f, c) => {
    const celdaInicial = tablero[f][c];
    if (typeof celdaInicial !== 'object' || celdaInicial.indice === undefined) return [[f, c]];
    
    const { orientacion, total, indice } = celdaInicial;
    const celdas = [];

    for (let i = 0; i < total; i++) {
      const fD = orientacion === 'V' ? f - indice + i : f;
      const cD = orientacion === 'H' ? c - indice + i : c;
      if (fD >= 0 && fD < tamano && cD >= 0 && cD < tamano) {
        celdas.push([fD, cD]);
      }
    }
    return celdas;
  };

  //colocacion barco
  const colocarBarcoManual = (f, c) => {
    if (!barcoSeleccionado || fasePartida !== 'COLOCANDO') return;
    const nuevoTablero = tableroMio.map(fila => [...fila]);
    const celdasAOCupar = [];

    for (let i = 0; i < barcoSeleccionado.tam; i++) {
      const filaD = orientacion === 'V' ? f + i : f;
      const colD = orientacion === 'H' ? c + i : c;
      if (filaD >= tamano || colD >= tamano) {
        alert("¡El barco se sale del tablero!");
        return;
      }
      const celdaActual = nuevoTablero[filaD][colD];
      const estaOcupada = celdaActual !== ESTADOS_CASILLAS.VACIO && celdaActual !== null;
      if (estaOcupada) {
        alert("Casilla ocupada, elige otra posición.");
        return;
      }
      celdasAOCupar.push([filaD, colD, i]); 
    }

    celdasAOCupar.forEach(([fd, cd, indice]) => { 
      nuevoTablero[fd][cd] = {
        tipo: ESTADOS_CASILLAS.BARCO,
        barcoId: barcoSeleccionado.id,
        orientacion: orientacion,
        indice: indice, 
        total: barcoSeleccionado.tam
      };
    });

    setTableroMio(nuevoTablero);
    setBarcosColocados([...barcosColocados, barcoSeleccionado]);
    setBarcoSeleccionado(null); 
    setCeldasSombra([]);
  };

  //logica disparo
  const disparar = (f, c) => {
    const tipoEnemigo = tableroEnemigo[f][c]?.tipo ?? tableroEnemigo[f][c];
    if (fasePartida !== 'JUGANDO' || !turnoMio || celdasSombra.length > 0 || !turnoMio || 
        tipoEnemigo === ESTADOS_CASILLAS.TOCADO || tipoEnemigo === ESTADOS_CASILLAS.AGUA || tipoEnemigo === ESTADOS_CASILLAS.HUNDIDO) return;
    
    // MOCK para que no de error
    if (socketService?.socket?.connected) {
        socketService.disparar(codigoSala, f, c);
    }

    // MOCK logica de jugabilidad
    setTableroEnemigo((tableroActual) => {
        const nuevoEnemigos = tableroActual.map(fila => [...fila]);
        const celdaEnemiga = nuevoEnemigos[f][c];
        const tipoActual = celdaEnemiga?.tipo ?? celdaEnemiga;

        let aciertoBarco = false;

        if (tipoActual === ESTADOS_CASILLAS.BARCO) {
            aciertoBarco = true;
            
            nuevoEnemigos[f][c] = typeof celdaEnemiga === 'object' 
                ? { ...celdaEnemiga, tipo: ESTADOS_CASILLAS.TOCADO } 
                : ESTADOS_CASILLAS.TOCADO;

            const celdasDelBarco = obtenerCeldasBarcoCompleto(nuevoEnemigos, f, c);
            const estaHundido = celdasDelBarco.every(([bf, bc]) => {
                const t = nuevoEnemigos[bf][bc]?.tipo ?? nuevoEnemigos[bf][bc];
                return t === ESTADOS_CASILLAS.TOCADO || t === ESTADOS_CASILLAS.HUNDIDO;
            });

            if (estaHundido) {
                celdasDelBarco.forEach(([bf, bc]) => {
                    const c_obj = nuevoEnemigos[bf][bc];
                    nuevoEnemigos[bf][bc] = typeof c_obj === 'object' 
                        ? { ...c_obj, tipo: ESTADOS_CASILLAS.HUNDIDO } 
                        : ESTADOS_CASILLAS.HUNDIDO;
                });
                console.log("¡Hundimos un barco enemigo!");
            }
        } else if (tipoActual === ESTADOS_CASILLAS.VACIO) {
            nuevoEnemigos[f][c] = ESTADOS_CASILLAS.AGUA;
        }

        if (!aciertoBarco) {
            setTurnoMio(false); 
        }

        return nuevoEnemigos;
    });
  };

  //MOCK para simular que el backend nos manda un disparo
  const simularAtaqueEnemigo = () => {
    try {
      let f, c, tipoActual;
      let intentos = 0;
      do {
        f = Math.floor(Math.random() * tamano);
        c = Math.floor(Math.random() * tamano);
        const celda = tableroMio[f][c];
        tipoActual = celda?.tipo ?? celda;
        intentos++;
      } while ((tipoActual === ESTADOS_CASILLAS.TOCADO || tipoActual === ESTADOS_CASILLAS.AGUA || tipoActual === ESTADOS_CASILLAS.HUNDIDO) && intentos < 100);

      let impactoEnBarco = false; //control del turno

      setTableroMio((tableroActual) => {
        const nuevoTablero = tableroActual.map(fila => [...fila]);
        const celdaAtacada = nuevoTablero[f][c];
        const tipo = celdaAtacada?.tipo ?? celdaAtacada;

        if (tipo === ESTADOS_CASILLAS.BARCO) {
          impactoEnBarco = true; //conservam turno si hay acierto
          
          nuevoTablero[f][c] = typeof celdaAtacada === 'object' 
            ? { ...celdaAtacada, tipo: ESTADOS_CASILLAS.TOCADO } 
            : ESTADOS_CASILLAS.TOCADO;

          const celdasDelBarco = obtenerCeldasBarcoCompleto(nuevoTablero, f, c);
          const estaHundido = celdasDelBarco.every(([bf, bc]) => {
            const t = nuevoTablero[bf][bc]?.tipo ?? nuevoTablero[bf][bc];
            return t === ESTADOS_CASILLAS.TOCADO || t === ESTADOS_CASILLAS.HUNDIDO;
          });

          if (estaHundido) {
            celdasDelBarco.forEach(([bf, bc]) => {
              const c_obj = nuevoTablero[bf][bc];
              nuevoTablero[bf][bc] = typeof c_obj === 'object' 
                ? { ...c_obj, tipo: ESTADOS_CASILLAS.HUNDIDO } 
                : ESTADOS_CASILLAS.HUNDIDO;
            });
            console.log("¡Han hundido nuestro barco!");
          }
        } else if (tipo === ESTADOS_CASILLAS.VACIO) {
          nuevoTablero[f][c] = ESTADOS_CASILLAS.AGUA;
        }
        return nuevoTablero;
      });

      setTimeout(() => {
        if (!impactoEnBarco) {
          setTurnoMio(true);
        }
      }, 0);

    } catch (error) {
      console.error("Error en simulacro:", error);
    }
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
              setFasePartida('COLOCANDO');
            }}
            style={{ marginTop: '50px', padding: '15px 30px', background: '#10b981', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            [MOCK] Simular que el rival se conectó
          </button>
        </div>
      );
    }

  if (cargando) return <div style={{color: 'white', padding: '50px', textAlign: 'center'}}>Cargando flota...</div>;

  const totalBarcosAColocar = numeroBarcos ? Object.values(numeroBarcos).reduce((a, b) => a + b, 0) : 0;

  return (
    <div style={{ background: '#1a1a1a', color: 'white', width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
      <header style={{ padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333' }}>
        <button onClick={alSalir} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>← ABORTAR</button>
        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>
          {fasePartida === 'COLOCANDO' ? `CONFIGURACIÓN DE FLOTA (${tamano}x${tamano})` : 
           (fasePartida === 'JUGANDO' ? (turnoMio ? "TU TURNO" : "TURNO ENEMIGO") : "SALA DE TRANSMISIÓN")}
        </h2>
        <div style={{ width: '80px' }}></div>
      </header>
        
      
      

      <main style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
    
        {fasePartida === 'COLOCANDO' && (
          <aside style={{ width: '300px', background: '#222', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRight: '1px solid #333', overflowY: 'auto' }}>
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

            {/*MOCK  preparacion*/}
            {barcosColocados.length === totalBarcosAColocar && (
              <button
                onClick={() => setFasePartida('JUGANDO')} //aqui enviariamos tablero_listo por socket
                style={{ marginTop: '20px', padding: '15px', fontSize: '16px', cursor: 'pointer', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}
              >
                [MOCK] ¡LISTO PARA LUCHAR!
              </button>
            )}
          </aside>
        )}

  
        <section style={{ flex: 1, display: 'flex', flexDirection: fasePartida === 'COLOCANDO' ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', gap: '30px', padding: '20px', position: 'relative' }}>
          
          {/*mi tablero*/}
          {(fasePartida === 'COLOCANDO' || fasePartida === 'JUGANDO') && (
            <div style={{ transform: fasePartida === 'JUGANDO' ? 'scale(0.85)' : 'scale(1)', transition: 'all 0.5s', textAlign: 'center', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#aaa' }}>TU FLOTA</h4>
              <Tablero 
                cuadricula={tableroMio} 
                alDisparar={fasePartida === 'COLOCANDO' ? colocarBarcoManual : () => {}}
                esIA={false} 
                celdasSombra={fasePartida === 'COLOCANDO' ? celdasSombra : []}
                alEntrarCelda={manejarHover}
                alSalirTablero={() => setCeldasSombra([])}
              />
            </div>
          )}

          {/*tablero enemigo*/}
          {fasePartida === 'JUGANDO' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transform: 'scale(0.95)', transition: 'all 0.5s', boxShadow: turnoMio ? '0 0 20px #3b82f6' : 'none', borderRadius: '8px', textAlign: 'center' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#3b82f6' }}>OCÉANO ENEMIGO</h4>
              <Tablero
                cuadricula={tableroEnemigo}
                alDisparar={disparar}
                esIA={true}
                celdasSombra={[]}
                alEntrarCelda={() => {}}
                alSalirTablero={() => {}}
              />

              {/* boton MOCK solo para pruebas sin backend */}
              {!turnoMio && (
                <button 
                  onClick={simularAtaqueEnemigo}
                  style={{ padding: '15px 30px', background: '#eab308', color: 'black', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  [MOCK] Forzar respuesta enemiga
                </button>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

const estiloBotonSalir = {
  position: 'absolute', top: '20px', left: '20px', background: '#ef4444', 
  color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer'
};

export default JuegoPrivada;