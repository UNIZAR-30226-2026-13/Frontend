import { BARCOS, TABLEROS, ESTADOS_CASILLAS, POWER_UPS } from '../constants/configuracion'; 

//const TAM = TABLEROS.ESTANDAR_TAM;

//Crear mapa con power-ups
export const generarTabPowerUps = (tamano, numPowerups, powerupsDisponibles) => {
  let mapa = Array(tamano).fill(null).map(() => Array(tamano).fill(ESTADOS_CASILLAS.VACIO));; // Crea matriz vacía

  //si no han elegido power-ups o el ratio es 0, mapa vacio
  if (!powerupsDisponibles || powerupsDisponibles.length === 0 || numPowerups <= 0) {
      return mapa;
  }

  // Ponemos, por ejemplo, 5 power-ups aleatorios
  for (let i = 0; i < numPowerups; i++) {
    let colocado = false;
    let intentos = 0;
    while (!colocado && intentos < 1000) {
      const f = Math.floor(Math.random() * tamano);
      const c = Math.floor(Math.random() * tamano);
      if (mapa[f][c] === ESTADOS_CASILLAS.VACIO) {
        const idAleatorio = powerupsDisponibles[Math.floor(Math.random() * powerupsDisponibles.length)];
        mapa[f][c] = idAleatorio; // Guardamos el ID del power-up
        colocado = true;
      }
      intentos++;
    }
  }
  return mapa;
};

export const obtenerHoverPowerUp = (f, c, powerUpSeleccionado, tamano) => {
  const celdasCoordenadas = obtenerCeldasImpacto( f, c, powerUpSeleccionado?.id, tamano);
  return celdasCoordenadas.map(([rf, rc]) => `${rf}-${rc}`);
};


export const obtenerCeldasImpacto = (f, c, tipo, tamano) => {
  const celdas = [[f, c]]; // Por defecto

  if (tipo === 'deflagrador') {
    const adyacentes = [
      [f - 1, c], [f + 1, c], 
      [f, c - 1], [f, c + 1]
    ];
    adyacentes.forEach(([af, ac]) => {
      if (af >= 0 && af < tamano && ac >= 0 && ac < tamano) {
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

/* Radar: Revela cuantos barcos hay en el cuadrate de la celda elegida */

export const usarRadar = (f,c,tableroEnemigo, tamano) => {
  const mitad = Math.floor(tamano/2);
  const filaMin = f < mitad ? 0 : mitad;
  const filaMax = f < mitad ? mitad : tamano;
  const colMin = c < mitad ? 0 : mitad;
  const colMax = c < mitad ? mitad : tamano;

  let barcosRestantes = 0;
  for (let i = filaMin; i < filaMax; i++){
    for (let j = colMin; j < colMax; j++){
      const tipoR = tableroEnemigo[i][j]?.tipo ?? tableroEnemigo[i][j];
      if (tipoR === ESTADOS_CASILLAS.BARCO || tipoR === ESTADOS_CASILLAS.ESCUDO){
        barcosRestantes++;
      }
    }
  }

  const cuadrante = (f < mitad ? 0 : 2) + (c < mitad ? 0 : 1);

  return { cuadrante, barcosRestantes, filaMin, filaMax, colMin, colMax};
};

/* Escudo: Aplica un escudo a una celda de tu tablero */
export const aplicarEscudo = (f,c, tableroMio) => {
  const celda = tableroMio[f][c];
  const tipoCelda = celda?.tipo ?? celda;
  if (tipoCelda !== ESTADOS_CASILLAS.BARCO) return null;

  const nuevoTablero = tableroMio.map(fila => [...fila]);
  nuevoTablero[f][c] = typeof celda === 'object' ? { ...celda, tipo: ESTADOS_CASILLAS.ESCUDO }: ESTADOS_CASILLAS.ESCUDO;
  return nuevoTablero;
};

/*Tornado: dispara a 5 celdas random del cuadrante al cual pertenece esa celda */
export const usarTornado = (f, c, tableroEnemigo, tamano) => {
  const mitad = Math.floor(tamano / 2);
  const filaMin = f < mitad ? 0 : mitad;
  const filaMax = f < mitad ? mitad : tamano;
  const colMin = c < mitad ? 0 : mitad;
  const colMax = c < mitad ? mitad : tamano;

  // Recogemos celdas válidas del cuadrante
  const celdasDisponibles = [];
  for (let i = filaMin; i < filaMax; i++) {
    for (let j = colMin; j < colMax; j++) {
      const tipoT = tableroEnemigo[i][j]?.tipo ?? tableroEnemigo[i][j];
      if (tipoT !== ESTADOS_CASILLAS.TOCADO && tipoT !== ESTADOS_CASILLAS.AGUA && tipoT !== ESTADOS_CASILLAS.HUNDIDO) {
        celdasDisponibles.push([i, j]);
      }
    }
  }

  const rand = celdasDisponibles.sort(() => Math.random() - 0.5);

  return rand.slice(0, 5);
};


// export default PowerUps;