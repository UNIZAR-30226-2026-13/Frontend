import React from 'react';
import IconoDefault from '../assets/IconoDefault.png'

function Menu({ alElegir, usuario }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100vw',
      height: '100vh',
      background: '#1a1a1a',
      color: 'white',
      gap: '20px'
    }}>

      {/* Botón de perfil arriba a la derecha */}
      <div
        onClick={() => alElegir('PERFIL')}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          background: '#333',
          border: '2px solid #555',
          borderRadius: '10px',
          padding: '16px',
        }}
      >
        <div style={{
          width: '50px', 
          height: '50px', 
          borderRadius: '50%',
          background: '#555', 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center', 
          fontSize: '18px',
          overflow: 'hidden'
        }}>
          <img 
            src={IconoDefault} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          /> {/*foto aqui*/}       
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{usuario?.username || 'Jugador'}</span>
          <span style={{ fontSize: '12px', color: '#ffffff' }}>ELO: {usuario?.elo ?? 0}</span>
        </div>
      </div>


      <h1 style={{ fontSize: '50px', color: '#ffffff', marginBottom: '60px' }}>HUNDE LA FLOTA</h1>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '50px'
      }}>
        {/*botones de los modos*/}
        <button 
          onClick={() => alElegir('1VS1')} 
          style={botonHeroStyle}
        >
          1 VS 1
        </button>

        <div style={{
          display: 'flex',
          gap: '30px'
        }}>
          <button 
            onClick={() => alElegir('IA')} 
            style={botonStyle}
          >
            JUGAR VS IA
          </button>

          <button 
            onClick={() => alElegir('PRIVADA')} 
            style={botonStyle}
          >
            PARTIDA PRIVADA
          </button>
        </div>
      </div>
    </div>
  );
}

const botonStyle = {
  padding: '15px 40px',
  fontSize: '20px',
  fontWeight: 'bold',
  background: '#333',
  color: 'white',
  border: '2px solid #555',
  borderRadius: '10px',
  cursor: 'pointer',
  width: '300px',
  transition: 'all 0.3s'
};

const botonHeroStyle = {
  padding: '25px 40px',
  fontSize: '26px',
  fontWeight: 'bold',
  background: '#3b82f6',
  color: 'white',
  border: '2px solid #60a5fa',
  borderRadius: '10px',
  cursor: 'pointer',
  width: '630px', 
  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
  transition: 'all 0.3s'
};

export default Menu;