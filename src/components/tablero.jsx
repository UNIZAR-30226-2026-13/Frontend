import Celda from './celda';
import { useState } from 'react';

function Tablero({ cuadricula, alDisparar, esIA, powerUpSeleccionado, celdasSombra = [], alEntrarCelda, alSalirTablero }) {
  const [hoveredPos, setHoveredPos] = useState(null);

  const debeResaltar = (i, j) => {
    if (!hoveredPos) return false;

    if (powerUpSeleccionado?.id === 'deflagrador') {
      const hF = hoveredPos.i;
      const hC = hoveredPos.j;
      return (i === hF && j === hC) ||
             (i === hF - 1 && j === hC) ||
             (i === hF + 1 && j === hC) ||
             (i === hF && j === hC - 1) ||
             (i === hF && j === hC + 1);
    }

    // Por defecto
    return i === hoveredPos.i && j === hoveredPos.j;
  };
  const tamano = cuadricula.length;
  
  return (
    <div 
      onMouseLeave={alSalirTablero} 
      style={{
        display: 'grid', 
        gridTemplateColumns: `repeat(${tamano}, 40px)`, 
        gap: '4px',
        backgroundColor: '#222', 
        padding: '10px', 
        borderRadius: '8px'
      }}
    >
      {cuadricula.map((fila, i) => 
        fila.map((valor, j) => (
          <Celda 
            key={`${i}-${j}`} 
            valor={valor} 
            esIA={esIA}
            estaEnSombra={celdasSombra.includes(`${i}-${j}`)} 
            alClickar={() => alDisparar(i, j)} 
            alEntrar={() => alEntrarCelda && alEntrarCelda(i, j)}
          />
        ))
      )}
    </div>
  );
}
export default Tablero;