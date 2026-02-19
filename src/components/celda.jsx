
function Celda({ valor, alClickar }) {
  
  const mostrarContenido = () => {
    if (valor === 0) return "";    // Agua no tocada
    if (valor === 1) return ""; // Barco 
    if (valor === 2) return "🔥"; // Tocado 
    if (valor === 3) return ""; // Fallo 
    return "";
  };

  const obtenerColorDeFondo = () => {
    if (valor === 2) return "#555555"; 
    if (valor === 3) return "#2abbeb"; 
    return "#100b0b"; 
  };

  const estiloCelda = {
    width: '50px',
    height: '50px',
    border: '1px solid #333',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    cursor: 'pointer',
    backgroundColor: obtenerColorDeFondo(), 
    transition: 'background-color 0.3s ease' 
  };

  return (
    <div style={estiloCelda} onClick={alClickar}>
      {mostrarContenido()}
    </div>
  );
}

export default Celda;