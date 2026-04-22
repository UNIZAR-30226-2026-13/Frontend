import { ESTADOS_CASILLAS } from '../constants/configuracion';

function Celda({ valor, alClickar, esIA, estaEnSombra, alEntrar }) {
  
  const obtenerColor = () => {
    if (estaEnSombra) return "rgba(59, 130, 246, 0.4)"; 

    switch (valor) {
      case ESTADOS_CASILLAS.TOCADO: return "#4b5563";
      case ESTADOS_CASILLAS.HUNDIDO: return "#b91c1c"; 
      case ESTADOS_CASILLAS.AGUA: return "#3b82f6"; 
      case ESTADOS_CASILLAS.BARCO: return !esIA ? "#4b5563" : "#100b0b";
      case ESTADOS_CASILLAS.ESCUDO: return "#0fb7ea"
      

      default: return "#100b0b";
  } 
  };

  return (
    <div 
      onClick={alClickar}
      onMouseEnter={alEntrar}
      style={{
        width: '40px',
        height: '40px',
        border: '1px solid #333', 
        backgroundColor: obtenerColor(),
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px', 
        transition: 'all 0.2s ease', 
        boxShadow: estaEnSombra ? 'inset 0 0 10px #3b82f6' : 'none' 
      }}
    >
      {!esIA && valor === ESTADOS_CASILLAS.BARCO && (
        <div style={{
          width: '80%', height: '80%', background: '#4a5568', borderRadius: '4px', border: '1px solid #718096'
        }} />
      )}

      {valor === ESTADOS_CASILLAS.TOCADO && (
        <div style={{
          color: '#ef4444',
          fontWeight: 'bold'
        }}>✕</div>
      )}

      {valor === ESTADOS_CASILLAS.ESCUDO && (
        <div style={{ fontSize: '22px' }}>🛡️</div>
      )}
      
      {!esIA && valor === ESTADOS_CASILLAS.MINA && (
        <div style={{ fontSize: '18px' }}>💣</div>
      )}
    </div>
  );
}

export default Celda;