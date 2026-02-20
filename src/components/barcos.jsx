import { BARCOS } from '../constants/configuracion';

function Barcos({ barcoSeleccionado, alSeleccionar, barcosColocados, orientacion, alCambiarOrientacion }) {
  return (
    <div style={{ padding: '20px', background: '#222', borderRadius: '10px', color: 'white' }}>
      <h3>Coloca tu flota</h3>
      <button onClick={alCambiarOrientacion} style={{ marginBottom: '10px', padding: '5px' }}>
        Orientación: {orientacion === 'H' ? 'Horizontal' : 'Vertical'}
      </button>
      
      <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
        {Object.values(BARCOS).map((barco) => {
          // Comprobar si ya hemos colocado todos los barcos de este tipo
          const cantidadColocada = barcosColocados.filter(b => b.id === barco.id).length;
          const estaCompleto = cantidadColocada >= barco.cantidad;

          return (
            <div 
              key={barco.id}
              onClick={() => !estaCompleto && alSeleccionar(barco)}
              style={{
                padding: '10px',
                border: barcoSeleccionado?.id === barco.id ? '2px solid #3b82f6' : '1px solid #444',
                backgroundColor: estaCompleto ? '#1a1a1a' : '#333',
                cursor: estaCompleto ? 'not-allowed' : 'pointer',
                opacity: estaCompleto ? 0.5 : 1
              }}
            >
              <strong>{barco.nombre}</strong> ({barco.tam} celdas)
              <br />
              {cantidadColocada} / {barco.cantidad}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Barcos;