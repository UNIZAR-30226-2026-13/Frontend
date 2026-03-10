import Celda from './celda';
import { useState } from 'react';

function Tablero({ cuadricula, alDisparar, esIA, powerUpSeleccionado }) {
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
    <div style={{
      display: 'grid', 
      gridTemplateColumns: `repeat(${tamano}, 40px)`, 
      gap: '4px',
      backgroundColor: '#222', 
      padding: '10px', 
      borderRadius: '8px'
    }}>
      {cuadricula.map((fila, i) => 
        fila.map((valor, j) => (
          <Celda 
            key={`${i}-${j}`} 
            valor={valor} 
            esIA={esIA}
            alClickar={() => alDisparar(i, j)} 
            estaResaltada={debeResaltar(i, j)}
            alEntrar={() => setHoveredPos({ i, j })}
            alSalir={() => setHoveredPos(null)}
          />
        ))
      )}
    </div>
  );
}
export default Tablero;