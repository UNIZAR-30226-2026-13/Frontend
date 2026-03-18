import { ESTADOS_CASILLAS } from '../constants/configuracion';

function Celda({ valor, alClickar, esIA, estaEnSombra, alEntrar }) {
  
  const obtenerColor = () => {
    if (valor === ESTADOS_CASILLAS.TOCADO) return "#4b5563";
    if (valor === ESTADOS_CASILLAS.AGUA) return "#3b82f6";
    if (valor === ESTADOS_CASILLAS.BARCO && !esIA) return "#4b5563";

    if (estaEnSombra) return "rgba(59, 130, 246, 0.5)"; 

    return "#100b0b"; 
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
        fontSize: '20px',
        transition: 'background-color 0.1s ease', 
        boxShadow: estaEnSombra ? 'inset 0 0 10px #3b82f6' : 'none'
      }}
    >
      {valor === ESTADOS_CASILLAS.TOCADO && "🔥"}
    </div>
  );
}
export default Celda;