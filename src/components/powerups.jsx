import { BARCOS, TABLEROS, ESTADOS_CASILLAS, POWER_UPS } from '../constants/configuracion'; 

const TAM = TABLEROS.ESTANDAR_TAM;

//Crear mapa con power-ups
export const generarTabPowerUps = () => {
  let mapa = Array(TAM).fill(null).map(() => Array(TAM).fill(ESTADOS_CASILLAS.VACIO));; // Crea matriz vacía
  const keys = Object.keys(POWER_UPS);
  
  // Ponemos, por ejemplo, 5 power-ups aleatorios
  for (let i = 0; i < 5; i++) {
    let colocado = false;
    while (!colocado) {
      const f = Math.floor(Math.random() * TAM);
      const c = Math.floor(Math.random() * TAM);
      if (mapa[f][c] === ESTADOS_CASILLAS.VACIO) {
        const itemAleatorio = POWER_UPS[keys[Math.floor(Math.random() * keys.length)]];
        mapa[f][c] = itemAleatorio.id; // Guardamos el ID del power-up
        colocado = true;
      }
    }
  }
  return mapa;
};

export const obtenerCeldasImpacto = (f, c, tipo) => {
  const celdas = [[f, c]]; // Por defecto

  if (tipo === 'deflagrador') {
    const adyacentes = [
      [f - 1, c], [f + 1, c], 
      [f, c - 1], [f, c + 1]
    ];
    
    adyacentes.forEach(([af, ac]) => {
      if (af >= 0 && af < TAM && ac >= 0 && ac < TAM) {
        celdas.push([af, ac]);
      }
    });
  }
  return celdas;
};

export const procesarInventario = (inventarioActual, powerUpUsado, powerUpsEncontrados) => {
  let nuevoInventario = [...inventarioActual];

  // Añadimos los powerups
  powerUpsEncontrados.forEach(id => {
    const powerUpCompleto = Object.values(POWER_UPS).find(p => p.id === id);
    if (powerUpCompleto) nuevoInventario.push(powerUpCompleto);
  });

  // Consumimos los powerups
  if (powerUpUsado) {
    const indice = nuevoInventario.findIndex(p => p?.id === powerUpUsado.id);
    if (indice !== -1) nuevoInventario.splice(indice, 1);
  }

  return nuevoInventario;
};

// export default PowerUps;