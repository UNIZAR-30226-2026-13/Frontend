import { BARCOS } from '../constants/configuracion';

function Barcos({ barcoSeleccionado, alSeleccionar, barcosColocados, orientacion, alCambiarOrientacion }) {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '15px', 
      width: '100%' 
    }}>
      <h3 style={{ margin: '0 0 10px 0' }}>Flota</h3>
      
      <button 
        onClick={alCambiarOrientacion} 
        style={{ 
          padding: '12px', 
          cursor: 'pointer', 
          background: '#3b82f6', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          fontWeight: 'bold'
        }}
      >
        Girar: {orientacion === 'H' ? 'Horizontal —' : 'Vertical |'}
      </button>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: '8px' 
      }}>
        {Object.values(BARCOS).map((barco) => {
          const cantidadColocada = barcosColocados.filter(b => b.id === barco.id).length;
          const estaCompleto = cantidadColocada >= barco.cantidad;

          return (
            <div 
              key={barco.id}
              onClick={() => !estaCompleto && alSeleccionar(barco)}
              style={{
                padding: '12px',
                border: barcoSeleccionado?.id === barco.id ? '2px solid #3b82f6' : '1px solid #444',
                backgroundColor: estaCompleto ? '#1a1a1a' : (barcoSeleccionado?.id === barco.id ? '#2d3748' : '#333'),
                cursor: estaCompleto ? 'not-allowed' : 'pointer',
                borderRadius: '8px',
                opacity: estaCompleto ? 0.4 : 1,
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{barco.nombre}</div>
              <div style={{ fontSize: '12px' }}>{cantidadColocada} / {barco.cantidad} unidades</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Barcos;