import { POWER_UPS } from '../constants/configuracion';

function PowerUps({ powerupsmios, inventarioMio, alSeleccionar, powerupSeleccionado }) {
  return (
    <div style={{ padding: '20px', background: '#222', borderRadius: '10px', color: 'white' }}>
      <h3>Inventario</h3>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '10px' }}>
        {Object.values(POWER_UPS).map((powerup) => {
          //const cantidad = inventarioMio.length;

          return (
            <div 
              key={powerup.id}
              onClick={() => alSeleccionar(barco)}
              style={{
                padding: '10px',
                border: powerupSeleccionado?.id === powerup.id ? '2px solid #3b82f6' : '1px solid #444',
              }}
            >
              <strong>{powerup.nombre}</strong> ({powerup.icono})
              <br />
              {/* {powerup.cantidad} */}
            </div>
          );
        })}
      </div>
    </div>
);
}

export default PowerUps;