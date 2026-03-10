import { useState, useEffect } from 'react';
import Tablero from '../components/tablero';
import Barcos from '../components/barcos';
import { BARCOS, TABLEROS, ESTADOS_CASILLAS, POWER_UPS } from '../constants/configuracion'; 
import PowerUps from '../components/inventario';

// Usamos el valor del configuracion.js
const TAM = TABLEROS.ESTANDAR_TAM;

//Crear mapa
const generarTabVacio = () => {
  return Array(TAM).fill(null).map(() => Array(TAM).fill(ESTADOS_CASILLAS.VACIO));
};

//Crear mapa con power-ups
const generarTabPowerUps = () => {
  let mapa = generarTabVacio(); // Crea matriz vacía
  const keys = Object.keys(POWER_UPS);
  
  // Ponemos, por ejemplo, 5 power-ups aleatorios
  for (let i = 0; i < 5; i++) {
    let colocado = false;
    while (!colocado) {
      const f = Math.floor(Math.random() * TAM);
      const c = Math.floor(Math.random() * TAM);
      if (mapa[f][c] === ESTADOS_CASILLAS.VACIO) {
        const itemAleatorio = POWER_UPS[keys[Math.floor(Math.random() * keys.length)]];
        mapa[f][c] = itemAleatorio.id; // Guardamos el ID del power-up
        colocado = true;
      }
    }
  }
  return mapa;
};

const generarTableroIA = () => {
  let nuevoTablero = generarTabPowerUps();

  // Recorremos los tipos de barcos definidos en configuracion.js
  Object.values(BARCOS).forEach(barcoConfig => {
    // Colocamos la cantidad necesaria de cada barco (ej: 2 submarinos)
    for (let i = 0; i < barcoConfig.cantidad; i++) {
      let colocado = false;
      while (!colocado) {
        const orientacion = Math.random() > 0.5 ? 'H' : 'V';
        const f = Math.floor(Math.random() * TAM);
        const c = Math.floor(Math.random() * TAM);

        // Validar si cabe y no choca
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

function modoIA({alSalir}) {
  const [mios, Mios] = useState(generarTabVacio());
  const [enemigos, Enemigos] = useState(generarTabVacio());
  const [turnoMio, TurnoMio] = useState(true);

  //Barcos
  const [fase, setFase] = useState('COLOCANDO');
  const [barcoSeleccionado, setBarcoSeleccionado] = useState(null);
  const [orientacion, setOrientacion] = useState('H');
  const [barcosColocados, setBarcosColocados] = useState([]);

  //Power-ups
  const [powerUpsMios, setPUMios] = useState(generarTabPowerUps()); // Posiciones de PU en MI tablero
  const [powerUpSeleccionado, setPowerUpSeleccionado] = useState(null);
  const [powerUpsEnemigos, setPUEnemigos] = useState(generarTabPowerUps()); // Se llenará al empezar batalla
  const [inventarioMio, setInventarioMio] = useState([]); // Power-ups que poseo

  //Ver si alguno ha ganado
  const ganoYo = !enemigos.flat().includes(ESTADOS_CASILLAS.BARCO);
  const ganaIA = !mios.flat().includes(ESTADOS_CASILLAS.BARCO);
  const fin = fase === 'JUGANDO' && (ganoYo || ganaIA);

  // useEffect reacciona al cambo de turno
  useEffect(() => {
    if (fase === 'JUGANDO' && !turnoMio && !fin) {
      const timer = setTimeout(() => {
        let f, c;
        
        do { 
            f = Math.floor(Math.random()*TAM);
            c = Math.floor(Math.random()*TAM); 
        }while (mios[f][c] === ESTADOS_CASILLAS.TOCADO || mios[f][c] == ESTADOS_CASILLAS.AGUA);

        const nuevo = mios.map(fila => [...fila]);
        const acierto = nuevo[f][c] === ESTADOS_CASILLAS.BARCO;
        nuevo[f][c] = acierto ? ESTADOS_CASILLAS.TOCADO : ESTADOS_CASILLAS.AGUA; //Si acierta se pone en tocado sino en agua

        Mios(nuevo); // Actualizar tablero
        if (!acierto) TurnoMio(true); // Solo cambio turno si falla
      }, 1500); // Ponemos algo de tiempo de epsera para q no sea caotico
      return () => clearTimeout(timer); 
    }
  }, [turnoMio, mios, fin, fase]); // Al depender de mios si acierta repite disparo

  // Mis disparos
  const disparar = (f, c) => {
    if (fase !== 'JUGANDO' || !turnoMio || fin || enemigos[f][c] > 1) return;

    const nuevoEnemigos = enemigos.map(fila => [...fila]);
    const copiaPUEnemigos = powerUpsEnemigos.map(fila => [...fila]);
    let aciertoGlobalBarco = false;
    let inventarioActualizado = [...inventarioMio]; // Copia local del inventario
  
    const celdasAfectadas = obtenerCeldasImpacto(f, c, 
      powerUpSeleccionado?.id === 'deflagrador' ? 'deflagrador' : 'normal'
    );

    celdasAfectadas.forEach(([df, dc]) => { // No hacemos nada si la celda está tocada o es agua
      if (nuevoEnemigos[df][dc] === ESTADOS_CASILLAS.TOCADO || 
          nuevoEnemigos[df][dc] === ESTADOS_CASILLAS.AGUA) return;

      const aciertoBarco = nuevoEnemigos[df][dc] === ESTADOS_CASILLAS.BARCO;
      nuevoEnemigos[df][dc] = aciertoBarco ? ESTADOS_CASILLAS.TOCADO : ESTADOS_CASILLAS.AGUA;
      if (aciertoBarco) aciertoGlobalBarco = true; // Poner acierto a true si el powerup impacta

      const powerUpEncontrado = copiaPUEnemigos[df][dc];
      // Recolectar Powerup si encontrado
      if (powerUpEncontrado) {
        const powerUpCompleto = Object.values(POWER_UPS).find(p => p.id === powerUpEncontrado)
        if (powerUpCompleto) {
          inventarioActualizado.push(powerUpCompleto);
        }
        copiaPUEnemigos[df][dc] = null; // Lo quitamos del tablero
      }
    });

    if (powerUpSeleccionado) {
      const pSid = powerUpSeleccionado.id;
      if (pSid === 'doble') {
        aciertoGlobalBarco = true; 
      }
      const indice = inventarioActualizado.findIndex(p => p?.id === pSid);
      if (indice !== -1) {
        inventarioActualizado.splice(indice, 1);
      }
      setPowerUpSeleccionado(null);
    }

    Enemigos(nuevoEnemigos);
    setPUEnemigos(copiaPUEnemigos);
    setInventarioMio(inventarioActualizado);

    if (!aciertoGlobalBarco) TurnoMio(false);
  };

  const obtenerCeldasImpacto = (f, c, tipo) => {
    const celdas = [[f, c]]; // Por defecto

    if (tipo === 'deflagrador') {
      const adyacentes = [
        [f - 1, c], [f + 1, c], 
        [f, c - 1], [f, c + 1]
      ];
      
      adyacentes.forEach(([af, ac]) => {
        if (af >= 0 && af < TAM && ac >= 0 && ac < TAM) {
          celdas.push([af, ac]);
        }
      });
    }
    return celdas;
  };

  const colocarBarco = (f, c) => {
    if (!barcoSeleccionado || fase !== 'COLOCANDO') return;

    const nuevoTablero = mios.map(fila => [...fila]);
    const celdasAOCupar = [];

    // calcular que celdas ocuparia
    for (let i = 0; i < barcoSeleccionado.tam; i++) {
      const filaD = orientacion === 'V' ? f + i : f;
      const colD = orientacion === 'H' ? c + i : c;

      // ver si se sale del mapa
      if (filaD >= TAM || colD >= TAM) {
        alert("¡El barco se sale del tablero!");
        return;
      }
      // ver si ya hay algo
      if (nuevoTablero[filaD][colD] !== ESTADOS_CASILLAS.VACIO) {
        alert("Casilla ocupada, elige otra posición.");
        return;
      }
      celdasAOCupar.push([filaD, colD]);
    }

    // colocar barco en el tablero
    celdasAOCupar.forEach(([fd, cd]) => {
      nuevoTablero[fd][cd] = ESTADOS_CASILLAS.BARCO;
    });

    Mios(nuevoTablero);
    setBarcosColocados([...barcosColocados, barcoSeleccionado]);
    // limpio seleccion para obligar a elegir otro o el mismo de nuevo
    setBarcoSeleccionado(null); 
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
  }

  const empezarBatalla = () => {
    const tableroEnemigoConBarcos = generarTableroIA();
    Enemigos(tableroEnemigoConBarcos);
    asignarPowerUps();
    setFase('JUGANDO');
  };

  return (
    <div style={{ textAlign: 'center',
    background: '#1a1a1a',
    color: 'white',
    width: '100vw',
    minHeight: '100vh',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
    }}>
      {/*Botones para salir al menu y el titulo*/}
      <div style={{width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <button onClick={alSalir} style={{background: '#ef4444',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            cursor: 'pointer'}}>

            ← Salir al Menú
            
        </button>
        <h1>{fase === 'COLOCANDO' ? "VS IA: COLOCA TU FLOTA" : (fin ? "FIN DE PARTIDA" : (turnoMio ? "TU TURNO" : "TURNO IA..."))}</h1>
        <div style={{width: '100px'}}></div> {/* Espaciador para centrar título */}
      </div>
      
      {fin && <button onClick={() => window.location.reload()} style={{padding: '10px'}}>Jugar otra vez</button>}

      <div style={{ 
        display: 'flex',
        flexDirection: fase === 'COLOCANDO' ? 'column' : 'row',
        alignsItems: 'center',
        justifyContent: 'center',
        gap: '40px',
        transition: 'all 0.5s'
        }}>
          <div style={{
            transform: fase === 'JUGANDO' ? 'scale(0.8)' : 'scale(1)',
            opacity: fase === 'JUGANDO' ? 0.7 : 1,
            transition: 'all 0.5s'
          }}>
            <h3 style={{ marginBottom: '10px' }}>TU TABLERO</h3>
            <Tablero cuadricula={mios} alDisparar={colocarBarco} esIA={false} powerUpSeleccionado={powerUpSeleccionado} />
            </div>
            {fase === 'JUGANDO' && (
              <div style={{
                transform: 'scale(1.1)',
                transition: 'all 0.5s',
                boxShadow: turnoMio ? '0 0 20px #3b82f6' : 'none',
                borderRadius: '8px',
              }}>
                <h3 style={{ marginBottom: '10px' }}>TABLERO ENEMIGO</h3>
                <Tablero cuadricula={enemigos} alDisparar={disparar} esIA={true} powerUpSeleccionado={powerUpSeleccionado}/>
                <PowerUps 
                  inventarioMio={inventarioMio}
                  powerUpSeleccionado={powerUpSeleccionado}
                  alSeleccionar={setPowerUpSeleccionado}
                />
              </div>
              
            )}
            {fase === 'COLOCANDO' && (
              <>
                <Barcos 
                  barcoSeleccionado={barcoSeleccionado}
                  alSeleccionar={setBarcoSeleccionado}
                  barcosColocados={barcosColocados}
                  orientacion={orientacion}
                  alCambiarOrientacion={() => setOrientacion(orientacion === 'H' ? 'V' : 'H')}
                />

                {barcosColocados.length === Object.values(BARCOS).reduce((a, b) => a + b.cantidad, 0) && (
                  <button
                    onClick={empezarBatalla}
                    style={{ marginTop: '30px', padding: '15px 40px', fontSize: '18px', cursor: 'pointer',
                      background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold'
                    }}
                  >
                    ¡EMPEZAR BATALLA!
                  </button>
                )}
              </>
            )}   
          </div>
      </div>
  );
}

export default modoIA;