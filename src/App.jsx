import { useState, useEffect } from 'react';
import Tablero from './components/tablero';
import Barcos from './components/barcos';
import { BARCOS, TABLEROS, ESTADOS_CASILLAS } from './constants/configuracion'; 

// Usamos el valor del configuracion.js
const TAM = TABLEROS.ESTANDAR_TAM;

//Crear mapa
const generarTabVacio = () => {
  return Array(TAM).fill(null).map(() => Array(TAM).fill(ESTADOS_CASILLAS.VACIO));
};

const generarTableroIA = () => {
  let nuevoTablero = Array(TAM).fill(null).map(() => Array(TAM).fill(ESTADOS_CASILLAS.VACIO));

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

function App() {
  const [mios, Mios] = useState(generarTabVacio());
  const [enemigos, Enemigos] = useState(generarTabVacio());
  const [turnoMio, TurnoMio] = useState(true);

  //Barcos
  const [fase, setFase] = useState('COLOCANDO');
  const [barcoSeleccionado, setBarcoSeleccionado] = useState(null);
  const [orientacion, setOrientacion] = useState('H');
  const [barcosColocados, setBarcosColocados] = useState([]);

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

    const nuevo = enemigos.map(fila => [...fila]);
    const acierto = nuevo[f][c] === ESTADOS_CASILLAS.BARCO;
    nuevo[f][c] = acierto ? ESTADOS_CASILLAS.TOCADO : ESTADOS_CASILLAS.AGUA;

    Enemigos(nuevo);
    if (!acierto) TurnoMio(false);
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

  const empezarBatalla = () => {
    const tableroEnemigoConBarcos = generarTableroIA();
    Enemigos(tableroEnemigoConBarcos);
    setFase('JUGANDO');
  };

  return (
    <div style={{ textAlign: 'center',
    background: '#1a1a1a',
    color: 'white',
    minHeight: '100vh',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
    }}>
      <h1>{fase === 'COLOCANDO' ? "COLOCA TU FLOTA" : (fin ? "FIN DE PARTIDA" : (turnoMio ? "TU TURNO" : "TURNO IA..."))}</h1>
      
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
            <Tablero cuadricula={mios} alDisparar={colocarBarco} esIA={false} />
            </div>
            {fase === 'JUGANDO' && (
              <div style={{
                transform: 'scale(1.1)',
                transition: 'all 0.5s',
                boxShadow: turnoMio ? '0 0 20px #3b82f6' : 'none',
                borderRadius: '8px',
              }}>
                <h3 style={{ marginBottom: '10px' }}>TABLERO ENEMIGO</h3>
                <Tablero cuadricula={enemigos} alDisparar={disparar} esIA={true} />
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

export default App;