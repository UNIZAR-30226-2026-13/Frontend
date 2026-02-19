import { useState, useEffect } from 'react';
import Tablero from './components/tablero';
import { TABLEROS } from './constants/configuracion'; 

// Usamos el valor del configuracion.js
const TAM = TABLEROS.ESTANDAR_TAM;

//Crear mapa
const generarTab = () => {
  const tablero = Array(TAM).fill(null).map(() => Array(TAM).fill(0));
  
  // Poner 3 barcos para probar
  tablero[2][0] = 1;
  tablero[2][1] = 1;
  tablero[2][2] = 1;
  tablero[5][0] = 1;
  tablero[5][1] = 1;
  tablero[5][2] = 1;
  tablero[8][0] = 1;
  tablero[8][1] = 1;
  tablero[8][2] = 1;

  return tablero;
};

function App() {
  const [mios, Mios] = useState(generarTab());
  const [enemigos, Enemigos] = useState(generarTab());
  const [turnoMio, TurnoMio] = useState(true);

  //Ver si alguno ha ganado
  const ganoYo = !enemigos.flat().includes(1);
  const ganaIA = !mios.flat().includes(1);
  const fin = ganoYo || ganaIA;

  // useEffect reacciona al cambo de turno
  useEffect(() => {
    if (!turnoMio && !fin) {
      const timer = setTimeout(() => {
        let f, c;
        
        do { 
            f = Math.floor(Math.random()*10);
            c = Math.floor(Math.random()*10); 
        }while (mios[f][c] > 1);

        const nuevo = mios.map(fila => [...fila]);
        const acierto = nuevo[f][c] === 1;
        nuevo[f][c] = acierto ? 2 : 3; //Si acierta se pone en tocado sino en agua

        Mios(nuevo); // Actualizar tablero
        if (!acierto) TurnoMio(true); // Solo cambio turno si falla
      }, 1500); // Ponemos algo de tiempo de epsera para q no sea caotico
    }
  }, [turnoMio, mios, fin]); // Al depender de mios si acierta repite disparo

  // Mis disparos
  const disparar = (f, c) => {
    if (!turnoMio || fin || enemigos[f][c] > 1) return;

    const nuevo = enemigos.map(fila => [...fila]);
    const acierto = nuevo[f][c] === 1;
    nuevo[f][c] = acierto ? 2 : 3;

    Enemigos(nuevo);
    if (!acierto) TurnoMio(false);
  };

  return (
    <div style={{ textAlign: 'center',
    background: '#1a1a1a',
    color: 'white',
    minHeight: '100vh',
    padding: '20px'
    }}>
      <h1>{fin ? (ganoYo ? "¡HAS GANADO!" : "¡PERDISTE!") : (turnoMio ? "TU TURNO" : "TURNO IA...")}</h1>
      
      {fin && <button onClick={() => window.location.reload()} style={{padding: '10px'}}>Jugar otra vez</button>}

      <div style={{ display: 'flex',
        justifyContent: 'center',
        gap: '50px',
        marginTop: '20px' 
        }}>
        <Tablero cuadricula={mios} alDisparar={() => {}} esIA={false} />
        <Tablero cuadricula={enemigos} alDisparar={disparar} esIA={true} />
      </div>
    </div>
  );
}

export default App;