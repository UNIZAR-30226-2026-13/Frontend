import Celda from './celda';

function Tablero({ cuadricula, alDisparar, esIA, celdasSombra = [], alEntrarCelda, alSalirTablero }) {
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