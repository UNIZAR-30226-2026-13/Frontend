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

export const obtenerHoverPowerUp = (f, c, powerUpSeleccionado) => {
  const celdasCoordenadas = obtenerCeldasImpacto( f, c, powerUpSeleccionado?.id);
  return celdasCoordenadas.map(([rf, rc]) => `${rf}-${rc}`);
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
    return celdas;
  }

  if (tipo === 'tor') {
      const { filaInicio, filaFin, colInicio, colFin } = obtenerLimitesCuadrante(f, c, TAM);
      const todasLasCeldas = [];
      
      for (let i = filaInicio; i < filaFin; i++) {
        for (let j = colInicio; j < colFin; j++) {
          todasLasCeldas.push([i, j]);
        }
      }
      // Afecta a 4 casillas aleatorias del cuadrante
      return todasLasCeldas.sort(() => Math.random() - 0.5).slice(0, 4);
  }
  return [[f, c]];
};

export const obtenerHoverTornado = (f, c, TAM) => {
  const { filaInicio, filaFin, colInicio, colFin } = obtenerLimitesCuadrante(f, c, TAM);
  const celdas = [];
  for (let i = filaInicio; i < filaFin; i++) {
    for (let j = colInicio; j < colFin; j++) {
      celdas.push(`${i}-${j}`);
    }
  }
  return celdas;
};

// Determina los límites del cuadrante según la posición (f, c) para torpedo
const obtenerLimitesCuadrante = (f, c, TAM) => {
  const mitad = Math.floor(TAM / 2);
  const filaInicio = f < mitad ? 0 : mitad;
  const filaFin = f < mitad ? mitad : TAM;
  const colInicio = c < mitad ? 0 : mitad;
  const colFin = c < mitad ? mitad : TAM;
  return { filaInicio, filaFin, colInicio, colFin };
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