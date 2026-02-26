import React from 'react';

function Modo1vs1({ alSalir }) {
  return (
    <div style={{ 
      textAlign: 'center',
      background: '#1a1a1a', 
      color: 'white',
      width: '100vw',        
      height: '100vh',    
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <button 
          onClick={alSalir} 
          style={{
            background: '#ef4444', 
            color: 'white', 
            border: 'none', 
            padding: '10px 20px', 
            borderRadius: '5px', 
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ← Salir al Menú
        </button>
        
        <h1 style={{ margin: 0 }}>1 VS 1</h1>
        <div style={{ width: '100px' }}></div> 
      </div>
    </div>
  );
}

export default Modo1vs1;