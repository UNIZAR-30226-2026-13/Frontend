import { ESTADOS_CASILLAS } from '../constants/configuracion';

function Celda({ valor, alClickar, esIA }) {
  const obtenerColor = () => {
    switch (valor) {
      case ESTADOS_CASILLAS.TOCADO: return "#4b5563"; // si esta tocado se pone gris 
      case ESTADOS_CASILLAS.AGUA: return "#3b82f6"; // si es agua se pone azul
      case ESTADOS_CASILLAS.BARCO: return esIA ? "#100b0b" : "#4b5563"; // Barcos del enemigo o tuyos
      default: return "#100b0b"; //
    }
  };

  return (
    <div 
      onClick={alClickar}
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
        transition: 'all 0.2s'
      }}
    >
      {valor === ESTADOS_CASILLAS.TOCADO && "🔥"}
    </div>
  );
}
export default Celda;