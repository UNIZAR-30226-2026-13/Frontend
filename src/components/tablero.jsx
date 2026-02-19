import { useState } from 'react';
import Celda from './celda'; 

function Tablero() {
  const [cuadricula, setCuadricula] = useState([
    [0, 1, 0, 0, 0],
    [0, 1, 0, 0, 0],
    [0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1],
    [0, 0, 2, 0, 0],
  ]);

  const manejarDisparo = (fila, columna) => {
    const valorActual = cuadricula[fila][columna];
    if (valorActual === 2 || valorActual === 3) return;

    const nuevaCuadricula = cuadricula.map(f => [...f]);

    if (valorActual === 1) {
      nuevaCuadricula[fila][columna] = 2;
    } else {
      nuevaCuadricula[fila][columna] = 3;
    }
    setCuadricula(nuevaCuadricula);
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 50px)', 
      gap: '5px',
      justifyContent: 'center',
      marginTop: '20px'
    }}>
      {cuadricula.map((fila, indiceFila) => 
        fila.map((valorCelda, indiceColumna) => (
          <Celda 
            key={`${indiceFila}-${indiceColumna}`} 
            valor={valorCelda} 
            alClickar={() => manejarDisparo(indiceFila, indiceColumna)}
          />
        ))
      )}
    </div>
  );
}
///Comprobaar
export default Tablero;