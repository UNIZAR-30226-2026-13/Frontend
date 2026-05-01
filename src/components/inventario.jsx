import { POWER_UPS } from '../constants/configuracion';
import imgMisilDoble from '../assets/misil_doble_bueno.png';
import imgMisilDefraglador from '../assets/misil_defraglador_bueno.png';
import imgEscudo from '../assets/escudo_bueno.png';
import imgRadar from '../assets/radar_bueno.png';
import imgTornado from '../assets/tornado_bueno.png';
import imgMina from '../assets/mina_bueno.png';


const iconos = {
  'doble.png': imgMisilDoble,
  'deflagrador.png': imgMisilDefraglador,
  'tornado.png': imgTornado,
  'escudo.png': imgEscudo,
  'mina.png': imgMina,
  'radar.png': imgRadar,
}

function PowerUps({ powerupsmios, inventarioMio, alSeleccionar, powerUpSeleccionado }) {
  return (
    <div style={{ padding: '10px', background: '#222', borderRadius: '10px', color: 'white' }}>
      {/*<h3 style={{ fontSize: '1rem', marginBottom: '10px' }}>Inventario</h3>*/}
      <div style={{ display: 'flex', flexDirection: 'row', gap: '5px', justifyContent: 'center'}}>
        {Object.values(POWER_UPS).map((powerup) => {
          const cantidad = inventarioMio.filter(item => item && item.id === powerup.id).length;
          const estaSeleccionado = powerUpSeleccionado?.id === powerup.id; 
          const imagenIcono = iconos[powerup.icono];
          return (
            <div 
              key={powerup.id}
              onClick={() => { 
                if (cantidad > 0){ 
                  alSeleccionar(estaSeleccionado ? null : powerup);
                }
              }} // Solo seleccionable si tiene powerups
              style={{
                padding: '5px',
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
              {/*<div style={{ fontSize: '20px' }}>{powerup.icono}</div>*/}
              <img
                src={imagenIcono}
                alt={powerup.nombre}
                style={{ width: '72px', height: '72px', objectFit: 'contain' }}
              />
              <strong style={{ fontSize: '0.7rem', display: 'block' }}>{powerup.nombre}</strong>
              <div style={{ // Contador
                position: 'absolute', 
                top: '4px',
                right: '4px',
                //marginTop: '5px',
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