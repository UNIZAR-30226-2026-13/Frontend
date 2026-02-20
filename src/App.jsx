import { useState, useEffect } from 'react';
import Tablero from './components/tablero';
import Barcos from './components/barcos';
import { TABLEROS, ESTADOS_CASILLAS } from './constants/configuracion'; 

// Usamos el valor del configuracion.js
const TAM = TABLEROS.ESTANDAR_TAM;

//Crear mapa
const generarTabVacio = () => {
  return Array(TAM).fill(null).map(() => Array(TAM).fill(ESTADOS_CASILLAS.VACIO));
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
  const fin = ganoYo || ganaIA;

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

  return (
    <div style={{ textAlign: 'center',
    background: '#1a1a1a',
    color: 'white',
    minHeight: '100vh',
    padding: '20px'
    }}>
      <h1>{fase === 'COLOCANDO' ? "COLOCA TU FLOTA" : (fin ? "FIN" : (turnoMio ? "TU TURNO" : "TURNO IA..."))}</h1>
      
      {fin && <button onClick={() => window.location.reload()} style={{padding: '10px'}}>Jugar otra vez</button>}

      <div style={{ display: 'flex',
        justifyContent: 'center',
        gap: '50px',
        marginTop: '20px' 
        }}>
          <div>
            <Tablero cuadricula={mios} alDisparar={colocarBarco} esIA={false} />
            {fase === 'COLOCANDO' && (
              <Barcos 
                barcoSeleccionado={barcoSeleccionado}
                alSeleccionar={setBarcoSeleccionado}
                barcosColocados={barcosColocados}
                orientacion={orientacion}
                alCambiarOrientacion={() => setOrientacion(orientacion === 'H' ? 'V' : 'H')}
              />
            )}
          </div>
          {fase === 'JUGANDO' && (
            <Tablero cuadricula={enemigos} alDisparar={disparar} esIA={true} />
          )}
      </div>
      {fase === 'COLOCANDO' && barcosColocados.length > 0 && (
          <button onClick={() => setFase('JUGANDO')} style={{marginTop: '20px', padding: '10px 20px', cursor: 'pointer'}}>
              ¡EMPEZAR BATALLA!
          </button>
      )}
    </div>
  );
}

export default App;