//import React from 'react';
//import { useEffect, useState } from 'react';
//import io from 'socket.io-client'; // Asumo que utilizamos socket.io en backend para las salas
//import { BARCOS, TABLEROS, ESTADOS_CASILLAS, POWER_UPS } from '../constants/configuracion'; 
//import { generarTabVacio } from './modoIA'
import React, { useEffect, useState } from 'react';
import socketService from '../api/socketService';
import apiService from '../api/apiService';
import { BARCOS, TABLEROS, ESTADOS_CASILLAS } from '../constants/configuracion'; 
import Tablero from '../components/tablero';
import Barcos from '../components/barcos';
import { POWER_UPS } from '../constants/configuracion'; 
import Inventario from '../components/inventario';
import { generarTabPowerUps, obtenerCeldasImpacto, procesarInventario, usarRadar, aplicarEscudo, usarTornado, obtenerHoverPowerUp} from '../components/Powerups';

const TAM = TABLEROS.ESTANDAR_TAM;

const generarTabVacio = () => {
  return Array(TAM).fill(null).map(() => Array(TAM).fill(ESTADOS_CASILLAS.VACIO));
};

//MOCK
const generarTableroEnemigoMock = () => {
  let nuevoTablero = generarTabVacio();
  Object.values(BARCOS).forEach(barcoConfig => {
    for (let i = 0; i < barcoConfig.cantidad; i++) {
      let colocado = false;
      while (!colocado) {
        const orientacion = Math.random() > 0.5 ? 'H' : 'V';
        const f = Math.floor(Math.random() * TAM);
        const c = Math.floor(Math.random() * TAM);
        let cabe = true;
        const celdas = [];
        for (let j = 0; j < barcoConfig.tam; j++) {
          const fD = orientacion === 'V' ? f + j : f;
          const cD = orientacion === 'H' ? c + j : c;
          if (fD >= TAM || cD >= TAM || nuevoTablero[fD][cD] !== ESTADOS_CASILLAS.VACIO) {
            cabe = false;
            break;
          }
          celdas.push([fD, cD]);
        }
        if (cabe) {
          celdas.forEach(([fd, cd], idx) => {
            nuevoTablero[fd][cd] = {
              tipo: ESTADOS_CASILLAS.BARCO,
              barcoId: barcoConfig.id,
              orientacion: orientacion,
              indice: idx,
              total: barcoConfig.tam
            };
          });
          colocado = true;
        }
      }
    }
  });
  return nuevoTablero;
};

const obtenerCeldasBarcoCompleto = (tablero, f, c) => {
  const celdaInicial = tablero[f][c];
  if (typeof celdaInicial !== 'object' || !celdaInicial?.barcoId) return [[f, c]];
  
  const { orientacion, total, indice } = celdaInicial;
  const celdas = [];
  for (let i = 0; i < total; i++) {
    const fD = orientacion === 'V' ? f - indice + i : f;
    const cD = orientacion === 'H' ? c - indice + i : c;
    if (fD >= 0 && fD < TAM && cD >= 0 && cD < TAM) {
      celdas.push([fD, cD]);
    }
  }
  return celdas;
};

function Modo1vs1({ salaId, alSalir, usuario }) {
  //const [mios, setMios] = useState(generarTabVacio());
  //const [enemigos, setEnemigos] = useState(generarTabVacio());
  //const [miTurno, setMiTurno] = useState(false);
  //const [idRival, setIdRival] = useState(null);

  //Estados de conexion y turnos
  const [fase, setFase] = useState('ESPERANDO_RIVAL');
  const [idPartida, setIdPartida] = useState(null);
  const [miTurno, setMiTurno] = useState(false);
  //const [idRival, setIdRival] = useState(null);
  const [idRival, setIdRival] = useState('Enemigo_Fantasma');

  //tableros
  const [mios, setMios] = useState(generarTabVacio());
  const [enemigos, setEnemigos] = useState(generarTabVacio());

  //fase de colocacion
  const [barcoSeleccionado, setBarcoSeleccionado] = useState(null);
  const [orientacion, setOrientacion] = useState('H');
  const [barcosColocados, setBarcosColocados] = useState([]);
  const [celdasSombra, setCeldasSombra] = useState([]);

  //powerups
  const [powerUpsMios, setPUMios] = useState(() => generarTabPowerUps(TAM, 5, Object.keys(POWER_UPS)));
  const [powerUpsEnemigos, setPUEnemigos] = useState(() => generarTabPowerUps(TAM, 5, Object.keys(POWER_UPS)));
  const [powerUpSeleccionado, setPowerUpSeleccionado] = useState(null);
  const [inventarioMio, setInventarioMio] = useState([]); 
  const [resultadoRadar, setResultadoRadar] = useState(null);
  const [mensajeMina, setMensajeMina] = useState(null);
  const [turnosPenalizadosEnemigo, setTurnosPenalizadosEnemigo] = useState(0);

  //calculo si ya se han puesto todos los barcos
  const totalBarcos = Object.values(BARCOS).reduce((acc, b) => acc + b.cantidad, 0);
  const todosColocados = barcosColocados.length === totalBarcos;

  //fin partida
  const [mostrarFin, setMostrarFin] = useState(false);
  
  //condicion victoria
  //const ganoYo = fase === 'JUGANDO' && !enemigos.flat().some(c => (c?.tipo ?? c) === ESTADOS_CASILLAS.BARCO);
  //const ganaEnemigo = fase === 'JUGANDO' && !mios.flat().some(c => (c?.tipo ?? c) === ESTADOS_CASILLAS.BARCO);
  //const fin = ganoYo || ganaEnemigo;

  //pausa
  const [estadoPausa, setEstadoPausa] = useState(null);

  //logica de victoria
  const TOTAL_IMPACTOS_PARA_GANAR = 17;

  const aciertosLogrados = enemigos.flat().filter(c => {
      const estado = (c?.tipo ?? c);
      return estado === "tocado" || estado === "hundido";
  }).length;

  const ganoYo = fase === 'JUGANDO' && aciertosLogrados === TOTAL_IMPACTOS_PARA_GANAR;

  const ganaEnemigo = fase === 'JUGANDO' && mios.length > 0 && !mios.flat().some(c => {
      const estado = (c?.tipo ?? c);
      return estado === "barco" || estado === ESTADOS_CASILLAS.BARCO || (typeof c === 'object' && c.tipo === 1);
  });

  const fin = ganoYo || ganaEnemigo;

  //temporizador para mostrar el fin partida
  /*useEffect(() => {
    if (fin) {
      const timer = setTimeout(() => {
        setMostrarFin(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [fin]);*/

  /*useEffect(() => {
    socketService.conectar();
    socketService.unirsePartida(salaId);

    
    socketService.onPartidaLista(({ jugadores, turnoDe }) => {
      const rival = jugadores.find(id => id !== socketService.getId());
      setIdRival(rival);
      setMiTurno(turnoDe === socketService.getId());
      setFase('COLOCANDO'); 
    });

    // Me dispara el rival
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
  }, [salaId]);*/

  //MOCK 
  /*useEffect(() => {
    //simular matchmaking
    if (fase === 'ESPERANDO_RIVAL') {
      const timerEncontrar = setTimeout(() => {
        // Simulamos que el servidor nos avisa: ¡Partida encontrada!
        setFase('COLOCANDO'); 
      }, 3000); // 3 segundos buscando...
      return () => clearTimeout(timerEncontrar);
    }

    // 2. Simular espera de que el rival coloque sus barcos
    if (fase === 'ESPERANDO_LISTO_RIVAL') {
      const timerRivalListo = setTimeout(() => {
        // Simulamos que el servidor dice: ¡Empezamos!
        setFase('JUGANDO');
        setMiTurno(true); // Te damos el primer turno por defecto
      }, 2500); // 2.5 segundos de espera
      return () => clearTimeout(timerRivalListo);
    }
  }, [fase]);*/

  //conexion al servidor y matchmaking
  useEffect(() => {
    socketService.conectar();
    socketService.unirseSalaPrivada();

    socketService.onPartidaEncontrada((datos) => {
      console.log("¡Alerta de Radar! Rival encontrado por Socket:", datos);
      setIdPartida(datos.partidaID);
      setFase('COLOCANDO');
    });
    //servidor nos dice que es nuestro turno
    socketService.onTuTurno((datos) => {
      console.log("Nuestro turno:", datos);
      setMios(datos.tablero);
      setEnemigos(datos.tableroRival);
      if (datos.inventario) setInventarioMio(adaptarInventario(datos.inventario));
      setMiTurno(true);
    });
    //recibimos disparo pero aun no es nuestro turno
    socketService.onActualizarEstado((datos) => {
      console.log("Impacto enemigo recibido:", datos);
      setMios(datos.tablero);
      setEnemigos(datos.tableroRival);
      if (datos.inventario) setInventarioMio(adaptarInventario(datos.inventario));
      setMiTurno(false);
    });

    if (fase === 'ESPERANDO_RIVAL') {
      const buscarOponente = async () => {
        try {
          const username = usuario?.user || usuario?.username || 'soldado_anonimo';
          const res = await apiService.buscarPartida(username);
          
          if (res.status === "Encontrada") {
            console.log("¡Rival encontrado al instante!", res);
            setIdPartida(res.partidaID);
            setFase('COLOCANDO');
          } else if (res.status === "InQueue") {
            console.log("Entrando en la cola. Aguardando señal de radio...");
          }
        } catch (error) {
          console.error("Fallo crítico de comunicaciones:", error);
          alert("Error al conectar con el cuartel general.");
          alSalir(); // Te saca al menú si el servidor está caído
        }
      };
      
      buscarOponente();
    }

    //MOCK temporal para colocacion
    if (fase === 'ESPERANDO_LISTO_RIVAL') {
      const timerRivalListo = setTimeout(() => {
        setFase('JUGANDO');
        setMiTurno(true); 
      }, 2500); 
      return () => clearTimeout(timerRivalListo);
    }

    return () => {
      if (fase === 'ESPERANDO_RIVAL' || fin) {
        socketService.desconectar();
      }
    };
  }, [fase, usuario, alSalir, fin]);

  //logca de colocacion
  //hover para mostrar donde se colocaria el barco
  const manejarHover = (f, c, esTableroEnemigo) => {
    try {
      let nuevasCeldas = [];
      if (fase === 'COLOCANDO') {
        if (esTableroEnemigo) { setCeldasSombra([]); return; }
        if (barcoSeleccionado) {
          for (let i = 0; i < barcoSeleccionado.tam; i++) {
            const filaD = orientacion === 'V' ? f + i : f;
            const colD = orientacion === 'H' ? c + i : c;
            if (filaD < TAM && colD < TAM) nuevasCeldas.push(`${filaD}-${colD}`);
          }
        }
      }
      else if (fase === 'JUGANDO') {
        if (miTurno) {
          const esPowerUpDefensivo = powerUpSeleccionado?.id === 'esc' || powerUpSeleccionado?.id === 'mine';
          if (esPowerUpDefensivo) {
            if (esTableroEnemigo) { setCeldasSombra([]); return; }
            nuevasCeldas = [...obtenerHoverPowerUp(f, c, powerUpSeleccionado, TAM)];
          } else {
            if (!esTableroEnemigo) { setCeldasSombra([]); return; }
            if (powerUpSeleccionado?.id === 'tor' || powerUpSeleccionado?.id === 'rad' ) {
              const mitad = Math.floor(TAM / 2);
              const filaMin = f < mitad ? 0 : mitad;
              const filaMax = f < mitad ? mitad : TAM;
              const colMin  = c < mitad ? 0 : mitad;
              const colMax  = c < mitad ? mitad : TAM;
              for (let i = filaMin; i < filaMax; i++)
                for (let j = colMin; j < colMax; j++) nuevasCeldas.push(`${i}-${j}`);
            }
            else if (powerUpSeleccionado) {
              nuevasCeldas = [...obtenerHoverPowerUp(f, c, powerUpSeleccionado, TAM)];
            } else {
              nuevasCeldas = [`${f}-${c}`];
            }
          }
        }
      }
      setCeldasSombra(nuevasCeldas);
    } catch (err) { console.error("Error Hover:", err); }
  };

  //simulador MOCK
  /*useEffect(() => {
    if (fase === 'JUGANDO' && !miTurno && !fin && !estadoPausa) {
      if (turnosPenalizadosEnemigo > 0) {
        setTurnosPenalizadosEnemigo(p => p - 1);
        setMiTurno(true);
        return;
      }
      const timer = setTimeout(() => {
        let rf, rc;
        
        do {
          rf = Math.floor(Math.random() * TAM);
          rc = Math.floor(Math.random() * TAM);
        } while (
          mios[rf][rc] === ESTADOS_CASILLAS.TOCADO || mios[rf][rc] === ESTADOS_CASILLAS.AGUA ||
          mios[rf][rc]?.tipo === ESTADOS_CASILLAS.TOCADO || mios[rf][rc]?.tipo === ESTADOS_CASILLAS.AGUA || 
          mios[rf][rc]?.tipo === ESTADOS_CASILLAS.HUNDIDO
        );

        const nuevo = mios.map(fila => [...fila]);
        const valorCelda = nuevo[rf][rc];
        const tipoActual = valorCelda?.tipo ?? valorCelda;

        if (tipoActual === ESTADOS_CASILLAS.MINA) {
          nuevo[rf][rc] = ESTADOS_CASILLAS.AGUA;
          setMios(nuevo);
          setTurnosPenalizadosEnemigo(1);
          setMensajeMina('enemigo'); 
          setMiTurno(true);
          return;
        }
        if (tipoActual === ESTADOS_CASILLAS.ESCUDO) {
          nuevo[rf][rc] = { ...valorCelda, tipo: ESTADOS_CASILLAS.BARCO }; 
          setMios(nuevo);
          setMiTurno(true); 
        } else {
          const acierto = tipoActual === ESTADOS_CASILLAS.BARCO;
          if (acierto) {
            nuevo[rf][rc] = { ...valorCelda, tipo: ESTADOS_CASILLAS.TOCADO };
            const celdasMias = obtenerCeldasBarcoCompleto(nuevo, rf, rc);
            const miBarcoHundido = celdasMias.every(([bf, bc]) => {
                const t = nuevo[bf][bc]?.tipo ?? nuevo[bf][bc];
                return t === ESTADOS_CASILLAS.TOCADO || t === ESTADOS_CASILLAS.HUNDIDO;
            });
            if (miBarcoHundido) {
                celdasMias.forEach(([bf, bc]) => {
                    nuevo[bf][bc] = { ...nuevo[bf][bc], tipo: ESTADOS_CASILLAS.HUNDIDO };
                });
            }
          } else {
            nuevo[rf][rc] = ESTADOS_CASILLAS.AGUA;
          }
          setMios(nuevo);
          if (!acierto) setMiTurno(true);
        }
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [miTurno, mios, fin, fase, turnosPenalizadosEnemigo, estadoPausa]);*/

  const usarEscudoEnMio = (f, c) => {
    if (powerUpSeleccionado?.id !== 'esc') return;
    const nuevoTablero = aplicarEscudo(f, c, mios);
    if (nuevoTablero === null) { alert('El escudo solo se puede colocar en barco'); return; }
    setMios(nuevoTablero);
    setInventarioMio(procesarInventario(inventarioMio, powerUpSeleccionado, []));
    setPowerUpSeleccionado(null);
  };

  const usarMinaEnMio = (f, c) => {
    if (powerUpSeleccionado?.id !== 'mine') return;
    if (mios[f][c] !== ESTADOS_CASILLAS.VACIO) { alert('La mina solo en agua'); return; }
    const nuevoTablero = mios.map(fila => [...fila]);
    nuevoTablero[f][c] = ESTADOS_CASILLAS.MINA;
    setMios(nuevoTablero);
    setInventarioMio(procesarInventario(inventarioMio, powerUpSeleccionado, []));
    setPowerUpSeleccionado(null);
  };

  const asignarPowerUps = () => {
    const nuevosPUsGanados = [];
    const powerupsMios = powerUpsMios.map(f => [...f]);
    for(let f=0; f<TAM; f++) {
      for(let c=0; c<TAM; c++) {
        const tipoCelda = mios[f][c]?.tipo ?? mios[f][c];
        if (tipoCelda === ESTADOS_CASILLAS.BARCO && powerupsMios[f][c]){
          nuevosPUsGanados.push(POWER_UPS[powerupsMios[f][c]]);
          powerupsMios[f][c] = null; 
        }
      }
    }
    setInventarioMio(nuevosPUsGanados);
    setPUMios(powerupsMios);
  };

  const textoOceano = () => {
    if (!powerUpSeleccionado) return 'OCÉANO ENEMIGO';
    switch (powerUpSeleccionado.id) {
      case 'deflagrador': return '💥 DISPARO DEFLAGRADOR';
      case 'doble':       return '🎯 DISPARO DOBLE';
      case 'tor':         return '🌪️ TORNADO';
      case 'rad':         return '📡 SELECCIONA CUADRANTE';
      default:            return 'OCÉANO ENEMIGO';
    }
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

    setMios(nuevoTablero);
    setBarcosColocados([...barcosColocados, barcoSeleccionado]);
    setBarcoSeleccionado(null); 
    setCeldasSombra([]); 
  };

  //escanear barcos
  const extraerBarcosDeCuadricula = (grid) => {
    const barcos = [];

    for (let f = 0; f < 10; f++) {
      for (let c = 0; c < 10; c++) {
        const celda = grid[f][c];
        
        if (celda && typeof celda === 'object' && celda.tipo === 1 && celda.indice === 0) {
          barcos.push({
            size: celda.total,
            f: f,
            c: c,
            orientacion: celda.orientacion
          });
        }
      }
    }
    return barcos;
  };

  //adapto inventario a backend
  const adaptarInventario = (inventarioBackend) => {
    if (!inventarioBackend) return [];
    
    const inventarioArray = [];
    Object.entries(inventarioBackend).forEach(([boostName, cantidad]) => {
      for (let i = 0; i < cantidad; i++) {
        inventarioArray.push({ id: boostName }); 
      }
    });
    return inventarioArray;
  };

  const confirmarTablero = async () => {
    try {
      console.log("Mapa interno del tablero:", mios);
      const barcosListos = extraerBarcosDeCuadricula(mios);
      console.log("Flota detectada y preparada para el envío:", barcosListos);

      //envio al backend
      const res = await apiService.colocarBarcos(idPartida, barcosListos);
      
      if (res.ok) {
        const datos = await res.json();
        console.log("Flota aprobada por el servidor:", datos);
        
        //servidor devuelve tablero
        setMios(datos.tablero); 
        setEnemigos(datos.tableroRival);
        setInventarioMio(adaptarInventario(datos.inventario));
        
        setFase('ESPERANDO_LISTO_RIVAL'); 
      } else {
        const errorData = await res.json();
        alert(`Fallo en la formación: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error en las comunicaciones de despliegue:", error);
    }
  };

  //logica de juego
  const dispararMultijugador = async (f, c) => {
    //controles
    if (fase !== 'JUGANDO' || !miTurno || fin || estadoPausa) return;
    const tipoEnemigo = enemigos[f][c]?.tipo ?? enemigos[f][c];
    if (tipoEnemigo === 'tocado' || tipoEnemigo === 'agua' || tipoEnemigo === 'hundido') return;
    if (powerUpSeleccionado?.id === 'esc' || powerUpSeleccionado?.id === 'mine') return;

    try {
      //envio disparo al servidor
      const tipoDisparo = powerUpSeleccionado ? "boost" : "disparo";
      const boostType = powerUpSeleccionado ? powerUpSeleccionado.id : "None";
      
      const res = await apiService.enviarMovimiento(idPartida, f, c, tipoDisparo, boostType);
      
      if (res.ok) {
        const datos = await res.json();
        //servidor nos devuelve resultado
        setEnemigos(datos.tableroRival);
        setMios(datos.tablero); 
        if (datos.inventario) setInventarioMio(adaptarInventario(datos.inventario));
        setMiTurno(datos.tuTurno);
        setPowerUpSeleccionado(null);
      }
    } catch (error) {
      console.error("Error al disparar:", error);
    }
  };

  //MOCK logica de disparo
  /*const dispararMultijugador = (f, c) => {
    const tipoEnemigo = enemigos[f][c]?.tipo ?? enemigos[f][c];
    if (fase !== 'JUGANDO' || !miTurno || fin || estadoPausa) return;
    if (tipoEnemigo === ESTADOS_CASILLAS.TOCADO || tipoEnemigo === ESTADOS_CASILLAS.AGUA || tipoEnemigo === ESTADOS_CASILLAS.HUNDIDO) return;
    
    if (powerUpSeleccionado?.id === 'esc' || powerUpSeleccionado?.id === 'mine') return;

    if (powerUpSeleccionado?.id === 'rad') {
      const resultado = usarRadar(f, c, enemigos, TAM);
      setResultadoRadar(resultado);
      setInventarioMio(procesarInventario(inventarioMio, powerUpSeleccionado, []));
      setPowerUpSeleccionado(null); return; 
    }

    if (powerUpSeleccionado?.id === 'tor') {
      const celdasImpacto = usarTornado(f, c, enemigos, TAM);
      const nuevoEnemigos = enemigos.map(fila => [...fila]);
      const copiaPUEnemigos = powerUpsEnemigos.map(fila => [...fila]);
      let acierto = false; const idsEncontrados = [];

      celdasImpacto.forEach(([tf, tc]) => {
        const celdaTor = nuevoEnemigos[tf][tc];
        const tipoTor = celdaTor?.tipo ?? celdaTor;
        const esBarco = tipoTor === ESTADOS_CASILLAS.BARCO;
        nuevoEnemigos[tf][tc] = esBarco ? (typeof celdaTor === 'object' ? { ...celdaTor, tipo: ESTADOS_CASILLAS.TOCADO } : ESTADOS_CASILLAS.TOCADO) : ESTADOS_CASILLAS.AGUA;
        if (esBarco) {
          acierto = true;
          const celdasDelBarco = obtenerCeldasBarcoCompleto(nuevoEnemigos, tf, tc);
          const hundido = celdasDelBarco.every(([bf, bc]) => {
            const t = nuevoEnemigos[bf][bc]?.tipo ?? nuevoEnemigos[bf][bc];
            return t === ESTADOS_CASILLAS.TOCADO || t === ESTADOS_CASILLAS.HUNDIDO;
          });
          if (hundido) celdasDelBarco.forEach(([bf, bc]) => {
            const cel = nuevoEnemigos[bf][bc];
            nuevoEnemigos[bf][bc] = typeof cel === 'object' ? { ...cel, tipo: ESTADOS_CASILLAS.HUNDIDO } : ESTADOS_CASILLAS.HUNDIDO;
          });
        }
        const idPU = copiaPUEnemigos[tf][tc];
        if (idPU) { idsEncontrados.push(idPU); copiaPUEnemigos[tf][tc] = null; }
      });

      setPowerUpSeleccionado(null); setEnemigos(nuevoEnemigos); setPUEnemigos(copiaPUEnemigos);
      setInventarioMio(procesarInventario(inventarioMio, powerUpSeleccionado, idsEncontrados));
      if (!acierto) setMiTurno(false);
      return;
    }

    const nuevoEnemigos = enemigos.map(fila => [...fila]);
    const copiaPUEnemigos = powerUpsEnemigos.map(fila => [...fila]);
    let aciertoGlobalBarco = false; const idsEncontrados = [];
    const celdasAfectadas = obtenerCeldasImpacto(f, c, powerUpSeleccionado?.id, TAM);

    celdasAfectadas.forEach(([df, dc]) => { 
      if (nuevoEnemigos[df][dc] === ESTADOS_CASILLAS.TOCADO || nuevoEnemigos[df][dc] === ESTADOS_CASILLAS.AGUA) return;
      const celdaEnemiga = nuevoEnemigos[df][dc];
      const tipoCeldaEnemiga = celdaEnemiga?.tipo ?? celdaEnemiga;
      const aciertoBarco = tipoCeldaEnemiga === ESTADOS_CASILLAS.BARCO;
      nuevoEnemigos[df][dc] = aciertoBarco ? (typeof celdaEnemiga === 'object' ? { ...celdaEnemiga, tipo: ESTADOS_CASILLAS.TOCADO } : ESTADOS_CASILLAS.TOCADO): ESTADOS_CASILLAS.AGUA;
      
      if (aciertoBarco) {
        aciertoGlobalBarco = true; 
        const celdasDelBarco = obtenerCeldasBarcoCompleto(nuevoEnemigos, df, dc);
        const estaHundido = celdasDelBarco.every(([bf, bc]) => {
          const t = nuevoEnemigos[bf][bc]?.tipo ?? nuevoEnemigos[bf][bc];
          return t === ESTADOS_CASILLAS.TOCADO || t === ESTADOS_CASILLAS.HUNDIDO;
        }); 
        if (estaHundido) {
          celdasDelBarco.forEach(([bf, bc]) => {
            const c = nuevoEnemigos[bf][bc];
            nuevoEnemigos[bf][bc] = typeof c === 'object' ? { ...c, tipo: ESTADOS_CASILLAS.HUNDIDO } : ESTADOS_CASILLAS.HUNDIDO;
          });
        }
      }
      const idEncontrado = copiaPUEnemigos[df][dc];
      if (idEncontrado) { idsEncontrados.push(idEncontrado); copiaPUEnemigos[df][dc] = null; }
    });

    if (powerUpSeleccionado?.id === 'doble') aciertoGlobalBarco = true; 
    setPowerUpSeleccionado(null); setEnemigos(nuevoEnemigos); setPUEnemigos(copiaPUEnemigos);
    setInventarioMio(procesarInventario(inventarioMio, powerUpSeleccionado, idsEncontrados));
    if (!aciertoGlobalBarco) setMiTurno(false);
  };*/

  //MOCK logica de pausa
  const solicitarPausa = () => {
    setEstadoPausa('solicitando');
    //simulacion de respuesta de enemigo en 2 seg
    setTimeout(() => {
      const enemigoAcepta = Math.random() > 0.4;
      if (enemigoAcepta) {
        setEstadoPausa('pausada');
      } else {
        setEstadoPausa('rechazada');
        setTimeout(() => setEstadoPausa(null), 2500); 
      }
    }, 2000);
  };

  const responderPausaRival = (acepta) => {
    if (acepta) {
      setEstadoPausa('pausada');
      //futuro aviso a backend: socketService.aceptarPausa(salaId)
    } else {
      setEstadoPausa(null);
      //futuro aviso a backend: socketService.rechazarPausa(salaId)
    }
  };

  //boton simulador de que el rival pide pausa
  const mockRivalPidePausa = () => {
    if (fase === 'JUGANDO' && !estadoPausa) setEstadoPausa('rival_solicita');
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
        <div style={{ display: 'flex', gap: '15px' }}>
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
          {/*boton pausa*/}
          {fase === 'JUGANDO' && !estadoPausa && !fin && (
            <button onClick={solicitarPausa} style={{ background: '#f59e0b', color: 'black', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
              Solicitar Pausa
            </button>
          )}
        </div>
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
                color: powerUpSeleccionado?.id === 'esc' || powerUpSeleccionado?.id === 'mine' ? '#f59e0b' : '#aaa'
                }}>{powerUpSeleccionado?.id === 'esc' ? '🛡️ ELIGE UNA CELDA PARA ESCUDAR' : powerUpSeleccionado?.id === 'mine' ? '💣 ELIGE UNA CELDA PARA MINAR' : 'TU FLOTA'}
              </h4>
              <Tablero 
                skin={usuario?.barco || 'default'}
                cuadricula={mios} 
                alDisparar={fase === 'COLOCANDO' ? colocarBarco : (powerUpSeleccionado?.id === 'esc' ? usarEscudoEnMio : (powerUpSeleccionado?.id === 'mine' ? usarMinaEnMio : () => {}))}
                esIA={false} 
                celdasSombra={(fase === 'COLOCANDO' || powerUpSeleccionado?.id === 'esc' || powerUpSeleccionado?.id === 'mine') ? celdasSombra : []}
                alEntrarCelda={(f, c) => manejarHover(f, c, false)}
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
            padding: '20px',
            overflowY: 'auto',
            flexWrap: 'wrap'
          }}>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              opacity: miTurno ? 0.7 : 1, 
              transform: 'scale(0.85)', 
              transition: 'all 0.3s',
              boxShadow: (powerUpSeleccionado?.id === 'esc' || powerUpSeleccionado?.id === 'mine') ? '0 0 20px #ec9c12' : 'none',
              borderRadius: '8px', padding: '15px' }}>
              <h4 style={{ 
                margin: '0 0 10px 0', 
                color: (powerUpSeleccionado?.id === 'esc' || powerUpSeleccionado?.id === 'mine') ? '#f59e0b' : '#aaa' }}>
                {powerUpSeleccionado?.id === 'esc' ? '🛡️ ELIGE UNA CELDA PARA ESCUDAR' : powerUpSeleccionado?.id === 'mine' ? '💣 ELIGE UNA CELDA PARA MINAR' : 'TU FLOTA'}
              </h4>
              <Tablero 
                skin={usuario?.barco || 'default'} 
                cuadricula={mios} 
                esIA={false} 
                alDisparar={powerUpSeleccionado?.id === 'esc' ? usarEscudoEnMio : (powerUpSeleccionado?.id === 'mine' ? usarMinaEnMio : () => {})}
                celdasSombra={(powerUpSeleccionado?.id === 'esc' || powerUpSeleccionado?.id === 'mine') ? celdasSombra : []}
                alEntrarCelda={(f, c) => manejarHover(f, c, false)}
                alSalirTablero={() => setCeldasSombra([])}
              />
            </div>

            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              boxShadow: miTurno ? '0 0 20px #3b82f6' : 'none', 
              borderRadius: '8px', 
              transform: 'scale(0.85)', 
              transition: 'all 0.3s',
              padding: '15px' }}>
              <h4 style={{ 
                margin: '0 0 10px 0', 
                color: powerUpSeleccionado ? '#f59e0b' : '#3b82f6'
                }}>{textoOceano()}
              </h4>
              <Tablero 
                skin={usuario?.barco || 'default'}
                cuadricula={enemigos} 
                alDisparar={dispararMultijugador} 
                esIA={true} 
                celdasSombra={(fase === 'JUGANDO' && powerUpSeleccionado?.id !== 'esc' && powerUpSeleccionado?.id !== 'mine') ? celdasSombra : []}
                alEntrarCelda={(f, c) => manejarHover(f, c, true)} alSalirTablero={() => setCeldasSombra([])}
              />
              <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '15px' }}>
                <Inventario 
                  inventarioMio={inventarioMio}
                  powerUpSeleccionado={powerUpSeleccionado}
                  alSeleccionar={setPowerUpSeleccionado}
                />
              </div>
            </div>
          </section>
        )}

        {/*radar mensaje*/}
            {resultadoRadar && (
              <div style={{
                position: 'absolute', top: '30px', right: '30px', background: '#1e3a5f', border: '2px solid #3b82f6',
                borderRadius: '10px', padding: '15px 20px', color: 'white', textAlign: 'center', zIndex: 5, minWidth: '180px'
              }}>
                <div style={{ fontSize: '24px' }}>📡</div>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>CUADRANTE {resultadoRadar.cuadrante + 1}</div>
                <div style={{ fontSize: '14px', color: '#93c5fd', marginBottom: '8px' }}>
                  Filas {resultadoRadar.filaMin + 1}–{resultadoRadar.filaMax} · Cols {resultadoRadar.colMin + 1}–{resultadoRadar.colMax}
                </div>
                <div style={{ fontSize: '18px' }}><strong>{resultadoRadar.barcosRestantes}</strong> celda{resultadoRadar.barcosRestantes !== 1 ? 's' : ''} de barco</div>
                <button onClick={() => setResultadoRadar(null)} style={{ marginTop: '10px', padding: '5px 12px', cursor: 'pointer', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', fontSize: '13px' }}>Cerrar</button>
              </div>
            )}

            {/*mina mensaje*/}
            {mensajeMina && (
              <div style={{
                position: 'absolute', top: '40%', left: '41%', transform: 'translate(-50%, -50%)', background: '#1a1a1a', border: '2px solid #7632ec',
                borderRadius: '12px', padding: '20px 35px', color: 'white', textAlign: 'center', zIndex: 20, boxShadow: '0 0 25px rgba(124, 58, 237, 0.6)'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>💣</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  {mensajeMina === 'enemigo' ? '¡El enemigo pisó tu mina! Pierde un turno.' : '¡Mina! Pierdes un turno.'}
                </div>
                <button onClick={() => setMensajeMina(null)} style={{ marginTop: '10px', padding: '5px 12px', cursor: 'pointer', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', fontSize: '13px' }}>Cerrar</button>
              </div>
            )}

        {/*pantalla de pausa*/}
        {estadoPausa === 'solicitando' && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 15 }}>
            <div style={{ background: '#1e3a5f', border: '2px solid #f59e0b', borderRadius: '10px', padding: '30px', textAlign: 'center', color: 'white' }}>
              <h3>SOLICITUD ENVIADA</h3>
              <p>Esperando a que el almirante enemigo acepte la tregua...</p>
              <div style={{ marginTop: '20px', width: '40px', height: '40px', border: '4px solid #f59e0b', borderRadius: '50%', borderTopColor: 'transparent', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
            </div>
          </div>
        )}

        {estadoPausa === 'rechazada' && (
          <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, 0)', background: '#ef4444', borderRadius: '10px', padding: '15px 30px', color: 'white', textAlign: 'center', zIndex: 15, boxShadow: '0 5px 15px rgba(0,0,0,0.5)' }}>
            <h3 style={{ margin: 0 }}>SOLICITUD DENEGADA</h3>
            <p style={{ margin: '5px 0 0 0' }}>El enemigo ha rechazado la pausa. ¡La batalla continúa!</p>
          </div>
        )}

        {estadoPausa === 'rival_solicita' && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 15 }}>
            <div style={{ background: '#1a1a1a', border: '2px solid #3b82f6', borderRadius: '10px', padding: '30px', textAlign: 'center', color: 'white', boxShadow: '0 0 30px rgba(59, 130, 246, 0.5)' }}>
              <h2 style={{ color: '#3b82f6', marginTop: 0 }}>ALERTA DE TREGUA</h2>
              <p style={{ fontSize: '1.2rem' }}>El enemigo ha solicitado pausar la partida.</p>
              <p style={{ color: '#aaa' }}>Podréis retomarla más tarde desde el menú principal.</p>
              
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '25px' }}>
                <button onClick={() => responderPausaRival(true)} style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 'bold' }}>
                  ACEPTAR
                </button>
                <button onClick={() => responderPausaRival(false)} style={{ padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', fontSize: '1.1rem', cursor: 'pointer', fontWeight: 'bold' }}>
                  RECHAZAR
                </button>
              </div>
            </div>
          </div>
        )}

        {estadoPausa === 'pausada' && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 20 }}>
            <div style={{ fontSize: '64px', marginBottom: '10px' }}>⏸️</div>
            <h2 style={{ fontSize: '36px', color: '#f59e0b', margin: 0 }}>PARTIDA PAUSADA</h2>
            <p style={{ color: '#aaa', fontSize: '1.2rem', marginBottom: '30px' }}>El estado de la flota ha sido guardado. Podéis retiraros.</p>
            
            <div style={{ display: 'flex', gap: '20px' }}>
              <button onClick={alSalir} style={{ padding: '15px 30px', fontSize: '18px', cursor: 'pointer', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>
                Guardar y Salir al Menú
              </button>
              
              {/*boton para testing para quitar la pausa sin tener que salir*/}
              <button onClick={() => setEstadoPausa(null)} style={{ padding: '15px 30px', fontSize: '18px', cursor: 'pointer', background: '#222', color: '#aaa', border: '1px solid #555', borderRadius: '8px' }}>
                [DEV] Reanudar
              </button>
            </div>
          </div>
        )}

        {/*boton MOCK simulacion de peticion de pausa del rival*/}
        {fase === 'JUGANDO' && !estadoPausa && (
          <button onClick={mockRivalPidePausa} style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'transparent', border: '1px solid #333', color: '#555', cursor: 'pointer' }}>
            Simular petición rival
          </button>
        )}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

        {/*pantalla de fin*/}
        {mostrarFin && (
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center', zIndex: 10
          }}>
            <h2 style={{ fontSize: '48px', color: 'white' }}>{ganoYo ? "¡VICTORIA!" : "DERROTA..."}</h2>
            <button onClick={alSalir} style={{
              padding: '15px 30px', fontSize: '20px', cursor: 'pointer',
              background: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', marginTop: '20px',
              fontWeight: 'bold'
            }}>
              Salir de la sala
            </button>
          </div>
        )}

      </main>
    </div>
  );
}

export default Modo1vs1;