import { ESTADOS_CASILLAS } from '../constants/configuracion';

function Celda({ valor, alClickar, esIA, estaResaltada, alEntrar, alSalir }) {
  const obtenerColor = () => {

    if (estaResaltada) return "#ecb036ff"; // si esta resaltada, color zdel hover
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
      onMouseEnter={alEntrar} // Avisa al tablero que el ratón entró aquí
      onMouseLeave={alSalir}  // Avisa que salió
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
        transition: 'all 0.2s',
        boxShadow: estaResaltada ? 'inset 0 0 10px rgba(106, 80, 42, 0.41)' : 'none'
      }}
    >
      {valor === ESTADOS_CASILLAS.TOCADO && "🔥"}
    </div>
  );
}
export default Celda;