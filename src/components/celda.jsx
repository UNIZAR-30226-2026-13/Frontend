function Celda({ valor, alClickar, esIA }) {
  const obtenerColor = () => {
    if (valor === 2) return "#4b5563"; // si esta tocado se pone gris ( mas sencillo por ahora y visible)
    if (valor === 3) return "#3b82f6"; // si es agua se pone azul
    if (esIA && valor === 1) return "#100b0b"; // Barcos del enemigo
    if (!esIA && valor === 1) return "#4b5563"; // Tus barcos
    
    return "#100b0b"; // Negro por defecto
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
      {valor === 2 && "🔥"}
      {valor === 3 && ""}
    </div>
  );
}
export default Celda;