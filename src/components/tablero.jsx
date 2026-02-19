import Celda from './celda';

function Tablero({ cuadricula, alDisparar, esIA }) {
  const tamano = cuadricula.length;
  return (
    <div style={{
      display: 'grid', 
      gridTemplateColumns: `repeat(${tamano}, 30px)`, 
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
          />
        ))
      )}
    </div>
  );
}
export default Tablero;