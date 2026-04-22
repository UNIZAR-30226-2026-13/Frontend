import { POWER_UPS } from '../constants/configuracion';

function PowerUps({ powerupsmios, inventarioMio, alSeleccionar, powerUpSeleccionado }) {
  return (
    <div style={{ padding: '20px', background: '#222', borderRadius: '10px', color: 'white' }}>
      <h3 style={{ fontSize: '1rem', marginBottom: '10px' }}>Inventario</h3>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '10px', justifyContent: 'center'}}>
        {Object.values(POWER_UPS).map((powerup) => {
          const cantidad = inventarioMio.filter(item => item && item.id === powerup.id).length;
          const estaSeleccionado = powerUpSeleccionado?.id === powerup.id; 

          return (
            <div 
              key={powerup.id}
              onClick={() => { 
                if (cantidad > 0){ 
                  alSeleccionar(estaSeleccionado ? null : powerup);
                }
              }} // Solo seleccionable si tiene powerups
              style={{
                padding: '10px',
                borderRadius: '8px',
                cursor: cantidad > 0 ? 'pointer' : 'not-allowed',
                opacity: cantidad > 0 ? 1 : 0.4,
                border: estaSeleccionado ? '2px solid #3b82f6' : '1px solid #444',
                background: estaSeleccionado ? '#333' : 'transparent',
                transform: estaSeleccionado ? 'scale(1.15)' : 'scale(1)',
                boxShadow: estaSeleccionado ? '0 0 15px 2px rgba(59, 130, 246, 0.6)' : 'none',
                position: 'relative', 
                minWidth: '80px',
                transition: '0.3'
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