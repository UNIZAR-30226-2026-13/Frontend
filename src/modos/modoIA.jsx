import { useState, useEffect } from 'react';
import Tablero from '../components/tablero';
import Barcos from '../components/barcos';
import { BARCOS, TABLEROS, ESTADOS_CASILLAS, POWER_UPS } from '../constants/configuracion'; 
import Inventario from '../components/inventario';
import { generarTabPowerUps, obtenerCeldasImpacto, procesarInventario, usarRadar, aplicarEscudo, usarTornado} from '../components/powerups';

const TAM = TABLEROS.ESTANDAR_TAM;

const generarTabVacio = () => {
  return Array(TAM).fill(null).map(() => Array(TAM).fill(ESTADOS_CASILLAS.VACIO));
};

const generarTableroIA = () => {
  //let nuevoTablero = generarTabPowerUps();
  let nuevoTablero = generarTabVacio();

  // Recorremos los tipos de barcos definidos en configuracion.js
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
          celdas.forEach(([fd, cd]) => nuevoTablero[fd][cd] = ESTADOS_CASILLAS.BARCO);
          colocado = true;
        }
      }
    }
  });
  return nuevoTablero;
};

const obtenerCeldasBarcoCompleto = (tablero, f, c) => {
  const celdas = [[f, c]];
  const direcciones = [[0, 1], [0, -1], [1, 0], [-1, 0]];

  direcciones.forEach(([df, dc]) => {
    let nf = f + df;
    let nc = c + dc;
    
    while (
      nf >= 0 && nf < TAM && nc >= 0 && nc < TAM && 
      (tablero[nf][nc] === ESTADOS_CASILLAS.BARCO || tablero[nf][nc] === ESTADOS_CASILLAS.TOCADO)
    ) {
      celdas.push([nf, nc]);
      nf += df;
      nc += dc;
    }
  });
  return celdas;
};

function ModoIA({alSalir, alElegir}) {
  const [mios, Mios] = useState(generarTabVacio());
  const [enemigos, Enemigos] = useState(generarTabVacio());
  const [turnoMio, TurnoMio] = useState(true);

  //Barcos
  const [fase, setFase] = useState('COLOCANDO');
  const [barcoSeleccionado, setBarcoSeleccionado] = useState(null);
  const [orientacion, setOrientacion] = useState('H');
  const [barcosColocados, setBarcosColocados] = useState([]);
  const [celdasSombra, setCeldasSombra] = useState([]);

  //Power-ups
  const [powerUpsMios, setPUMios] = useState(generarTabPowerUps()); // Posiciones de PU en MI tablero
  const [powerUpSeleccionado, setPowerUpSeleccionado] = useState(null);
  const [powerUpsEnemigos, setPUEnemigos] = useState(generarTabPowerUps()); // Se llenará al empezar batalla
  const [inventarioMio, setInventarioMio] = useState([]); // Power-ups que poseo

  //Ver si alguno ha ganado
  const ganoYo = !enemigos.flat().includes(ESTADOS_CASILLAS.BARCO);
  const ganaIA = !mios.flat().some(c => c === ESTADOS_CASILLAS.BARCO || c === ESTADOS_CASILLAS.ESCUDO);
  const fin = fase === 'JUGANDO' && (ganoYo || ganaIA);

  // Resultado del radar
  const [resultadoRadar, setResultadoRadar] = useState(null);

  // Fin
  const [mostrarFin, setMostrarFin] = useState(false);

  // penalizacion de la mina y su mensaje
  const [turnosPenalizados, setTurnosPenalizados] = useState(0);
  const [mensajeMina, setMensajeMina] = useState(null);


  // FInal de la partida y que haya retardo para mejorar el apartado visual
  useEffect(() => {
    if (fin) {
      const timer = setTimeout(() => {
        setMostrarFin(true); // Se muestra la pantalla 1 segundo después
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [fin]);

  // turno de la IA
  useEffect(() => {
    if (fase === 'JUGANDO' && !turnoMio && !fin) {
      // Si la IA tiene turnos penalizados, los consume sin disparar
      if (turnosPenalizados > 0) {
        setTurnosPenalizados(p => p - 1);
        TurnoMio(true);
        return;
      }
      const timer = setTimeout(() => {
        let f, c;
        do { 
            f = Math.floor(Math.random()*TAM);
            c = Math.floor(Math.random()*TAM); 
        } while (mios[f][c] === ESTADOS_CASILLAS.TOCADO || mios[f][c] === ESTADOS_CASILLAS.AGUA);

        const nuevo = mios.map(fila => [...fila]);
        if (nuevo[f][c] === ESTADOS_CASILLAS.MINA) {
          nuevo[f][c] = ESTADOS_CASILLAS.AGUA; // La mina explota
          Mios(nuevo);
          setTurnosPenalizados(1); // Pierde el siguiente turno
          setMensajeMina('ia');
          TurnoMio(true);
          return;
        }
        if (nuevo[f][c] === ESTADOS_CASILLAS.ESCUDO) {
          // Toca escudo, la celda vuelve a ser barco
          nuevo[f][c] = ESTADOS_CASILLAS.BARCO;
          Mios(nuevo);
          TurnoMio(true); // La IA pierde el disparo
        } else {
          const acierto = nuevo[f][c] === ESTADOS_CASILLAS.BARCO;
          nuevo[f][c] = acierto ? ESTADOS_CASILLAS.TOCADO : ESTADOS_CASILLAS.AGUA;
          Mios(nuevo);
          if (!acierto) TurnoMio(true);
        }
      }, 1500);
      return () => clearTimeout(timer); 
    }
  }, [turnoMio, mios, fin, fase]);

  const disparar = (f, c) => {
    if (fase !== 'JUGANDO' || !turnoMio || fin || enemigos[f][c] > 1) return;
    // radar
    if (powerUpSeleccionado?.id === 'rad') {
      const resultado = usarRadar(f, c, enemigos);
      setResultadoRadar(resultado);
      const inventarioActualizado = procesarInventario(inventarioMio, powerUpSeleccionado, []);
      setInventarioMio(inventarioActualizado);
      setPowerUpSeleccionado(null);
      return; // No pasa el turno
    }
    // tornado
    if (powerUpSeleccionado?.id === 'tor') {
      const celdasImpacto = usarTornado(f, c, enemigos);
      const nuevoEnemigos = enemigos.map(fila => [...fila]);
      const copiaPUEnemigos = powerUpsEnemigos.map(fila => [...fila]);
      let acierto = false;
      const idsEncontrados = [];

      celdasImpacto.forEach(([tf, tc]) => {
        const esBarco = nuevoEnemigos[tf][tc] === ESTADOS_CASILLAS.BARCO;
        nuevoEnemigos[tf][tc] = esBarco ? ESTADOS_CASILLAS.TOCADO : ESTADOS_CASILLAS.AGUA;
        if (esBarco) {
          acierto = true;
          const celdasDelBarco = obtenerCeldasBarcoCompleto(nuevoEnemigos, tf, tc);
          const hundido = celdasDelBarco.every(([bf, bc]) => nuevoEnemigos[bf][bc] === ESTADOS_CASILLAS.TOCADO);
          if (hundido) celdasDelBarco.forEach(([bf, bc]) => { nuevoEnemigos[bf][bc] = ESTADOS_CASILLAS.HUNDIDO; });
        }
        const idPU = copiaPUEnemigos[tf][tc];
        if (idPU) { idsEncontrados.push(idPU); copiaPUEnemigos[tf][tc] = null; }
      });

      const inventarioActualizado = procesarInventario(inventarioMio, powerUpSeleccionado, idsEncontrados);
      setPowerUpSeleccionado(null);
      Enemigos(nuevoEnemigos);
      setPUEnemigos(copiaPUEnemigos);
      setInventarioMio(inventarioActualizado);
      if (!acierto) TurnoMio(false);
      return;
    }
    if (powerUpSeleccionado?.id === 'esc') {
      const nuevoTablero = aplicarEscudo(f, c, mios);
      if (nuevoTablero === null) {
        alert('El escudo solo se puede colocar en una celda con barco.');
        return;
      }
      Mios(nuevoTablero);
      const inventarioActualizado = procesarInventario(inventarioMio, powerUpSeleccionado, []);
      setInventarioMio(inventarioActualizado);
      setPowerUpSeleccionado(null);
      return; // No pasa el turno
    }

    if (enemigos[f][c] === ESTADOS_CASILLAS.TOCADO || enemigos[f][c] === ESTADOS_CASILLAS.AGUA) return;

    const nuevoEnemigos = enemigos.map(fila => [...fila]);
    const copiaPUEnemigos = powerUpsEnemigos.map(fila => [...fila]);
    let aciertoGlobalBarco = false;
    const idsEncontrados = [];

    const celdasAfectadas = obtenerCeldasImpacto(f, c, powerUpSeleccionado?.id);

    celdasAfectadas.forEach(([df, dc]) => { // No hacemos nada si la celda está tocada o es agua
      if (nuevoEnemigos[df][dc] === ESTADOS_CASILLAS.TOCADO || 
          nuevoEnemigos[df][dc] === ESTADOS_CASILLAS.AGUA) return;

      const aciertoBarco = nuevoEnemigos[df][dc] === ESTADOS_CASILLAS.BARCO;
      nuevoEnemigos[df][dc] = aciertoBarco ? ESTADOS_CASILLAS.TOCADO : ESTADOS_CASILLAS.AGUA;
      if (aciertoBarco) {
          aciertoGlobalBarco = true; // Poner acierto a true si el disparo impacta

        const celdasDelBarco = obtenerCeldasBarcoCompleto(nuevoEnemigos, f, c);
        const estaHundido = celdasDelBarco.every(([bf, bc]) => nuevoEnemigos[bf][bc] === ESTADOS_CASILLAS.TOCADO);
        
        if (estaHundido) {
          celdasDelBarco.forEach(([bf, bc]) => {
            nuevoEnemigos[bf][bc] = ESTADOS_CASILLAS.HUNDIDO;
          });
        }
      }

      const idEncontrado = copiaPUEnemigos[df][dc];
      if (idEncontrado) {
        idsEncontrados.push(idEncontrado); 
        copiaPUEnemigos[df][dc] = null; 
      }
    });

  const inventarioActualizado = procesarInventario(inventarioMio, powerUpSeleccionado, idsEncontrados);

    if (powerUpSeleccionado?.id === 'doble') {
      aciertoGlobalBarco = true; 
    }

    setPowerUpSeleccionado(null);
    Enemigos(nuevoEnemigos);
    setPUEnemigos(copiaPUEnemigos);
    setInventarioMio(inventarioActualizado);

    if (!aciertoGlobalBarco) TurnoMio(false);
  };

  const manejarHover = (f, c) => {
    let nuevasCeldas = [];
    if (fase === 'COLOCANDO') {
      if (barcoSeleccionado) {
        for (let i = 0; i < barcoSeleccionado.tam; i++) {
          const filaD = orientacion === 'V' ? f + i : f;
          const colD = orientacion === 'H' ? c + i : c;
          if (filaD < TAM && colD < TAM) {
            nuevasCeldas.push(`${filaD}-${colD}`);
          } 
        }
      }
    }
    else if (fase === 'JUGANDO') {
      if (turnoMio) {
        if (powerUpSeleccionado?.id === 'tor' || powerUpSeleccionado?.id === 'rad' ) {
          const mitad = Math.floor(TAM / 2);
          const filaMin = f < mitad ? 0 : mitad;
          const filaMax = f < mitad ? mitad : TAM;
          const colMin  = c < mitad ? 0 : mitad;
          const colMax  = c < mitad ? mitad : TAM;
          for (let i = filaMin; i < filaMax; i++)
            for (let j = colMin; j < colMax; j++)
              nuevasCeldas.push(`${i}-${j}`);
        }
        else if (powerUpSeleccionado) {
          nuevasCeldas = [...obtenerHoverPowerUp(f, c, powerUpSeleccionado)];
        }
        else {
          nuevasCeldas = [`${f}-${c}`] // Solo la misma celda
        }
      }
    }
    setCeldasSombra(nuevasCeldas);
    return
  };

  // usar escudo
  const usarEscudoEnMio = (f, c) => {
    if (powerUpSeleccionado?.id !== 'esc') return;
    const nuevoTablero = aplicarEscudo(f, c, mios);
    if (nuevoTablero === null) {
      alert('El escudo solo se puede colocar en una celda con barco');
      return;
    }
    Mios(nuevoTablero);
    const inventarioActualizado = procesarInventario(inventarioMio, powerUpSeleccionado, []);
    setInventarioMio(inventarioActualizado);
    setPowerUpSeleccionado(null);
  };

  // usar mina
  const usarMinaEnMio = (f, c) => {
    if (powerUpSeleccionado?.id !== 'mine') return;
    if (mios[f][c] !== ESTADOS_CASILLAS.VACIO) {
      alert('La mina solo se puede colocar en agua (celda vacía)');
      return;
    }
    const nuevoTablero = mios.map(fila => [...fila]);
    nuevoTablero[f][c] = ESTADOS_CASILLAS.MINA;
    Mios(nuevoTablero);
    const inventarioActualizado = procesarInventario(inventarioMio, powerUpSeleccionado, []);
    setInventarioMio(inventarioActualizado);
    setPowerUpSeleccionado(null);
  };

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

    Mios(nuevoTablero);
    setBarcosColocados([...barcosColocados, barcoSeleccionado]);
    setBarcoSeleccionado(null); 
    setCeldasSombra([]);
  };

  const asignarPowerUps = () => {
    // Recolectamos PUs del jugador
    const nuevosPUsGanados = [];
    const powerupsMios = powerUpsMios.map(f => [...f]);

    for(let f=0; f<TAM; f++) {
      for(let c=0; c<TAM; c++) {
        // Si hay barco mío Y hay power-up en esa casilla
        if (mios[f][c] === ESTADOS_CASILLAS.BARCO && powerupsMios[f][c]) {
          nuevosPUsGanados.push(POWER_UPS[powerupsMios[f][c]]);
          powerupsMios[f][c] = null; // Se elimina del tablero porque ya se recolectó
        }
      }
    }
    setInventarioMio(nuevosPUsGanados);
    setPUMios(powerupsMios);
};

  const empezarBatalla = () => {
    const tableroEnemigoConBarcos = generarTableroIA();
    Enemigos(tableroEnemigoConBarcos);
    asignarPowerUps();
    setFase('JUGANDO');
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
//fase === 'COLOCANDO' ? "CONFIGURACIÓN DE FLOTA" : (fin ? "FIN DE PARTIDA" : (turnoMio ? "TU TURNO" : "TURNO IA..."))
  return (
    <div style={{ 
      background: '#1a1a1a', color: 'white', width: '100vw', height: '100vh', 
      display: 'flex', flexDirection: 'column', overflow: 'hidden' 
    }}>
      
      <header style={{ 
        padding: '10px 20px', display: 'flex', justifyContent: 'space-between', 
        alignItems: 'center', borderBottom: '1px solid #333'
      }}>
        <button onClick={alSalir} style={{
          background: '#ef4444', color: 'white', border: 'none', 
          padding: '8px 15px', borderRadius: '5px', cursor: 'pointer'
        }}>
          ← Menú
        </button>
        <h2 style={{ margin: 0, fontSize: '1.5rem' }}>
          {fase === 'COLOCANDO' ? "CONFIGURACIÓN DE FLOTA" : (fin ? "FIN DE PARTIDA" : (turnoMio ? "TU TURNO" : "TURNO IA..."))}
        </h2>
        <div style={{ width: '80px' }}></div> 
      </header>

      <main style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* fase de colocar los barcos*/}
        {fase === 'COLOCANDO' && (
          <aside style={{ 
            width: '300px', background: '#222', padding: '20px', 
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between', 
            borderRight: '1px solid #333', overflowY: 'auto' 
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

            {barcosColocados.length === Object.values(BARCOS).reduce((a, b) => a + b.cantidad, 0) && (
              <button
                onClick={empezarBatalla}
                style={{ 
                  marginTop: '20px', padding: '15px', fontSize: '16px', cursor: 'pointer',
                  background: '#10b981', color: 'white', border: 'none', 
                  borderRadius: '8px', fontWeight: 'bold'
                }}
              >
                ¡LISTO PARA LUCHAR!
              </button>
            )}
          </aside>
        )}

        <section style={{ 
          flex: 1, display: 'flex', flexDirection: fase === 'COLOCANDO' ? 'column' : 'row',
          alignItems: 'center', justifyContent: 'center', gap: '30px',
          padding: '20px', position: 'relative'
        }}>
          
          <div style={{
            transform: fase === 'JUGANDO' ? 'scale(0.85)' : 'scale(1)',
            opacity: fase === 'JUGANDO' ? (powerUpSeleccionado?.id === 'esc' || powerUpSeleccionado?.id === 'mine'? 1 : 0.7) : 1,
            transition: 'all 0.5s', textAlign: 'center',
            boxShadow: powerUpSeleccionado?.id === 'esc' || powerUpSeleccionado?.id === 'mine' ? '0 0 20px #ec9c12' : 'none',
            borderRadius: '8px', marginBottom: '100px', marginLeft: '50px'
          }}>
          <h4 style={{ margin: '0 0 10px 0', color: powerUpSeleccionado?.id === 'esc' || powerUpSeleccionado?.id === 'mine' ? '#f59e0b' : '#aaa' }}>
            {powerUpSeleccionado?.id === 'esc' ? '🛡️ ELIGE UNA CELDA PARA ESCUDAR' : 
            powerUpSeleccionado?.id === 'mine' ? '💣 ELIGE UNA CELDA PARA MINAR' : 'TU FLOTA'}
          </h4>
            <Tablero 
                cuadricula={mios} 
                alDisparar={
                  fase === 'COLOCANDO' ? colocarBarco :
                  (powerUpSeleccionado?.id === 'esc' ? usarEscudoEnMio : 
                  (powerUpSeleccionado?.id === 'mine' ? usarMinaEnMio : () => {}))
                }
                esIA={false} 
                celdasSombra={fase === 'COLOCANDO' ? celdasSombra : []}
                alEntrarCelda={manejarHover}
                alSalirTablero={() => setCeldasSombra([])}
            />
          </div>
          
          {/* fase de jugar ( depues de colocar) */}
          {fase === 'JUGANDO' && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 auto', width: 'fit-content',
              transform: 'scale(0.95)', transition: 'all 0.5s',
              boxShadow: turnoMio ? '0 0 20px #3b82f6' : 'none',
              borderRadius: '8px', textAlign: 'center'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: powerUpSeleccionado ? '#f59e0b' : '#3b82f6' }}>
                {textoOceano()}
              </h4>              
              <Tablero
                cuadricula={enemigos}
                alDisparar={disparar}
                esIA={true}
                celdasSombra={fase === 'JUGANDO' ? celdasSombra : []}
                alEntrarCelda={manejarHover}
                alSalirTablero={() => setCeldasSombra([])}/>
              <Inventario 
                inventarioMio={inventarioMio}
                powerUpSeleccionado={powerUpSeleccionado}
                alSeleccionar={setPowerUpSeleccionado}
              />
            </div>
          )}
          
          {/*El pop up del resultado del radar para el cuadrante */}
          {resultadoRadar && (
            <div style={{
              position: 'absolute', top: '30px', right: '30px',
              background: '#1e3a5f', border: '2px solid #3b82f6',
              borderRadius: '10px', padding: '15px 20px',
              color: 'white', textAlign: 'center', zIndex: 5,
              minWidth: '180px'
            }}>
              <div style={{ fontSize: '24px' }}>📡</div>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                CUADRANTE {resultadoRadar.cuadrante + 1}
              </div>
              <div style={{ fontSize: '14px', color: '#93c5fd', marginBottom: '8px' }}>
                Filas {resultadoRadar.filaMin + 1}–{resultadoRadar.filaMax} · 
                Cols {resultadoRadar.colMin + 1}–{resultadoRadar.colMax}
              </div>
              <div style={{ fontSize: '18px' }}>
                 <strong>{resultadoRadar.barcosRestantes}</strong> celda
                {resultadoRadar.barcosRestantes !== 1 ? 's' : ''} de barco
              </div>
              <button 
                onClick={() => setResultadoRadar(null)}
                style={{
                  marginTop: '10px', 
                  padding: '5px 12px', 
                  cursor: 'pointer',
                  background: '#3b82f6', 
                  color: 'white', 
                  border: 'none',
                  borderRadius: '5px', fontSize: '13px'
                }}
              >Cerrar</button>
            </div>
          )}

          {/* mensaje de la mina */}
          {mensajeMina && (
            <div style={{
              position: 'absolute', top: '40%', left: '41%',
              transform: 'translate(-50%, -50%)',
              background: '#1a1a1a',
              border: '2px solid #7632ec',
              borderRadius: '12px',
              padding: '20px 35px',
              color: 'white', 
              textAlign: 'center', 
              zIndex: 20,
              boxShadow: '0 0 25px rgba(124, 58, 237, 0.6)'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>💣</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                {mensajeMina === 'ia' ? '¡Mina! La IA pierde un turno.' : '¡Mina! Pierdes un turno.'}
              </div>
              <button 
                onClick={() => setMensajeMina(null)}
                style={{
                  marginTop: '10px', padding: '5px 12px', cursor: 'pointer',
                  background: '#3b82f6', color: 'white', border: 'none',
                  borderRadius: '5px', fontSize: '13px'
                }}
              >Cerrar</button>
            </div>
          )}

          {/* fin cuando ganas / pierdes */}
          {mostrarFin && (
            <div style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column',
              justifyContent: 'center', alignItems: 'center', zIndex: 10
            }}>
              <h2 style={{ fontSize: '48px' }}>{ganoYo ? "¡VICTORIA!" : "DERROTA..."}</h2>
              <button onClick={() => alElegir('IA')} style={{
                padding: '15px 30px', fontSize: '20px', cursor: 'pointer',
                background: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px'
              }}>
                Jugar otra vez
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default ModoIA;