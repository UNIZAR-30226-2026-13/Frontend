import { POWER_UPS } from '../constants/configuracion';

function PowerUps({ powerupsmios, inventarioMio, alSeleccionar, powerupSeleccionado }) {
  return (
    <div style={{ padding: '20px', background: '#222', borderRadius: '10px', color: 'white' }}>
      <h3 style={{ fontSize: '1rem', marginBottom: '10px' }}>Inventario</h3>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', justifyContent: 'center'}}>
        {Object.values(POWER_UPS).map((powerup) => {
          const cantidad = inventarioMio.filter(item => item && item.id === powerup.id).length;

          return (
            <div 
              key={powerup.id}
              onClick={() => cantidad > 0 && alSeleccionar(powerup)} // Solo seleccionable si tiene powerups
              style={{
                padding: '10px',
                borderRadius: '8px',
                cursor: cantidad > 0 ? 'pointer' : 'not-allowed',
                opacity: cantidad > 0 ? 1 : 0.4,
                border: powerupSeleccionado?.id === powerup.id ? '2px solid #3b82f6' : '1px solid #444',
                background: powerupSeleccionado?.id === powerup.id ? '#333' : 'transparent',
                position: 'relative', // Para posicionar el número
                minWidth: '80px'
              }}
            >
              <div style={{ fontSize: '20px' }}>{powerup.icono}</div>
              <strong style={{ fontSize: '0.7rem', display: 'block' }}>{powerup.nombre}</strong>
              <div style={{ // Contador
                marginTop: '5px',
                background: '#3b82f6',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {cantidad}
              </div>
            </div>
          );
        })}
      </div>
    </div>
);
}

export default PowerUps;