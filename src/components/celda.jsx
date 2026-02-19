// Definimos el componente Celda
// Recibe "props": el valor (agua, barco, etc.) y la función para cuando hagan clic
function Celda({ valor, alHacerClic }) {
  
  const mostrarContenido = () => {
    if (valor === 0) return "";    // Agua no tocada
    if (valor === 1) return "barco"; // Barco (esto solo se vería en MI tablero)
    if (valor === 2) return "tocado"; // Tocado (le dimos a un barco)
    if (valor === 3) return "agua"; // Fallo (le dimos al agua)
    return "";
  };

  // Estilos básicos para la celda
  const estiloCelda = {
    width: '50px',
    height: '50px',
    border: '1px solid #333',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    cursor: 'pointer',
    backgroundColor: valor === 3 ? '#2abbeb' : '#100b0b' // Azul si es agua, gris si no
  };

  return (
    <div style={estiloCelda} onClick={alHacerClic}>
      {mostrarContenido()}
    </div>
  );
}

export default Celda;