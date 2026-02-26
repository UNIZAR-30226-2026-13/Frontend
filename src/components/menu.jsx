import React from 'react';

function Menu({ alElegir }) {
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
      <h1 style={{ fontSize: '50px', color: '#ffffff', marginBottom: '40px' }}>HUNDE LA FLOTA</h1>
      
      <button 
        onClick={() => alElegir('IA')} 
        style={botonStyle}
      >
        JUGAR VS IA
      </button>

      <button 
        onClick={() => alElegir('1VS1')} 
        style={botonStyle}
      >
        1 VS 1
      </button>
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

export default Menu;