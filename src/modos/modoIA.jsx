import { useState, useEffect } from 'react';
import Tablero from '../components/tablero';
import Barcos from '../components/barcos';
import { BARCOS, TABLEROS, ESTADOS_CASILLAS, POWER_UPS } from '../constants/configuracion'; 
import Inventario from '../components/inventario';
import { generarTabPowerUps, obtenerCeldasImpacto, procesarInventario } from '../components/powerups';

const TAM = TABLEROS.ESTANDAR_TAM;

export const generarTabVacio = () => {
  return Array(TAM).fill(null).map(() => Array(TAM).fill(ESTADOS_CASILLAS.VACIO));
};

const generarTableroIA = () => {
  let nuevoTablero = generarTabPowerUps();

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

function ModoIA({alSalir}) {
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
  const ganaIA = !mios.flat().includes(ESTADOS_CASILLAS.BARCO);
  const fin = fase === 'JUGANDO' && (ganoYo || ganaIA);

  useEffect(() => {
    if (fase === 'JUGANDO' && !turnoMio && !fin) {
      const timer = setTimeout(() => {
        let f, c;
        do { 
            f = Math.floor(Math.random()*TAM);
            c = Math.floor(Math.random()*TAM); 
        } while (mios[f][c] === ESTADOS_CASILLAS.TOCADO || mios[f][c] === ESTADOS_CASILLAS.AGUA);

        const nuevo = mios.map(fila => [...fila]);
        const acierto = nuevo[f][c] === ESTADOS_CASILLAS.BARCO;
        nuevo[f][c] = acierto ? ESTADOS_CASILLAS.TOCADO : ESTADOS_CASILLAS.AGUA;

        Mios(nuevo);
        if (!acierto) TurnoMio(true);
      }, 1500);
      return () => clearTimeout(timer); 
    }
  }, [turnoMio, mios, fin, fase]);

  const disparar = (f, c) => {
    if (fase !== 'JUGANDO' || !turnoMio || fin || enemigos[f][c] > 1) return;

    const nuevoEnemigos = enemigos.map(fila => [...fila]);
    const copiaPUEnemigos = powerUpsEnemigos.map(fila => [...fila]);
    let aciertoGlobalBarco = false;
    const idsEncontrados = [];

    const celdasAfectadas = obtenerCeldasImpacto(f, c, 
      powerUpSeleccionado?.id === 'deflagrador' ? 'deflagrador' : 'normal'
    );

    celdasAfectadas.forEach(([df, dc]) => { // No hacemos nada si la celda está tocada o es agua
      if (nuevoEnemigos[df][dc] === ESTADOS_CASILLAS.TOCADO || 
          nuevoEnemigos[df][dc] === ESTADOS_CASILLAS.AGUA) return;

      const aciertoBarco = nuevoEnemigos[df][dc] === ESTADOS_CASILLAS.BARCO;
      nuevoEnemigos[df][dc] = aciertoBarco ? ESTADOS_CASILLAS.TOCADO : ESTADOS_CASILLAS.AGUA;
      if (aciertoBarco) {
          aciertoGlobalBarco = true; // Poner acierto a true si el powerup impacta

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
            opacity: fase === 'JUGANDO' ? 0.7 : 1,
            transition: 'all 0.5s', textAlign: 'center'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#aaa' }}>TU FLOTA</h4>
            <Tablero 
                cuadricula={mios} 
                alDisparar={colocarBarco} 
                esIA={false} 
                celdasSombra={celdasSombra}
                alEntrarCelda={manejarHover}
                alSalirTablero={() => setCeldasSombra([])}
            />
          </div>

          {fase === 'JUGANDO' && (
            <div style={{
              transform: 'scale(1.1)', transition: 'all 0.5s',
              boxShadow: turnoMio ? '0 0 20px #3b82f6' : 'none',
              borderRadius: '8px', textAlign: 'center'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#3b82f6' }}>OCÉANO ENEMIGO</h4>
              <Tablero cuadricula={enemigos} alDisparar={disparar} esIA={true} powerUpSeleccionado={powerUpSeleccionado}/>
              <Inventario 
                inventarioMio={inventarioMio}
                powerUpSeleccionado={powerUpSeleccionado}
                alSeleccionar={setPowerUpSeleccionado}
              />
            </div>
          )}

          {fin && (
            <div style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column',
              justifyContent: 'center', alignItems: 'center', zIndex: 10
            }}>
              <h2 style={{ fontSize: '3rem' }}>{ganoYo ? "¡VICTORIA!" : "DERROTA..."}</h2>
              <button onClick={() => window.location.reload()} style={{
                padding: '15px 30px', fontSize: '1.2rem', cursor: 'pointer',
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