import React, { useState, useEffect } from 'react';
import { ESTADOS_CASILLAS, BARCOS } from '../constants/configuracion';
import Celda from '../components/celda';

function JuegoPrivada({ alSalir, configuracion }) {
  const { tamano, numeroBarcos } = configuracion;

  const [tableroMio, setTableroMio] = useState([]);
  const [tableroEnemigo, setTableroEnemigo] = useState([]);
  const [turnoMio, setTurnoMio] = useState(true);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    prepararPartida();
  }, [configuracion]);

  const prepararPartida = () => {
    //crea tableros vacios
    let nuevoMio = Array(tamano).fill(null).map(() => Array(tamano).fill(ESTADOS_CASILLAS.VACIO));
    let nuevoEnemigo = Array(tamano).fill(null).map(() => Array(tamano).fill(ESTADOS_CASILLAS.VACIO));

    //lista barcos
    const listaTamanos = [];
    Object.entries(numeroBarcos).forEach(([id, cantidad]) => {
      for (let i = 0; i < cantidad; i++) {
        listaTamanos.push(BARCOS[id].tam);
      }
    });

    nuevoMio = colocarBarcosAleatorios(nuevoMio, [...listaTamanos]);
    nuevoEnemigo = colocarBarcosAleatorios(nuevoEnemigo, [...listaTamanos]);

    setTableroMio(nuevoMio);
    setTableroEnemigo(nuevoEnemigo);
    setCargando(false);
  };

  //funcion colocacion
  const colocarBarcosAleatorios = (tablero, tamanos) => {
    const copiaTablero = tablero.map(f => [...f]);
    
    tamanos.forEach(tam => {
      let colocado = false;
      while (!colocado) {
        const vertical = Math.random() > 0.5;
        const fila = Math.floor(Math.random() * tamano);
        const col = Math.floor(Math.random() * tamano);

        if (puedoColocar(copiaTablero, fila, col, tam, vertical)) {
          for (let i = 0; i < tam; i++) {
            const f = vertical ? fila + i : fila;
            const c = vertical ? col : col + i;
            copiaTablero[f][c] = ESTADOS_CASILLAS.BARCO;
          }
          colocado = true;
        }
      }
    });
    return copiaTablero;
  };

  const puedoColocar = (tablero, f, c, tam, vert) => {
    for (let i = 0; i < tam; i++) {
      const nf = vert ? f + i : f;
      const nc = vert ? c : c + i;
      if (nf >= tamano || nc >= tamano || tablero[nf][nc] !== ESTADOS_CASILLAS.VACIO) return false;
    }
    return true;
  };

  //logica disparo
  const disparar = (f, c) => {
    if (!turnoMio || tableroEnemigo[f][c] > 1) return;

    const nuevo = tableroEnemigo.map(fila => [...fila]);
    
    if (nuevo[f][c] === ESTADOS_CASILLAS.BARCO) {
      nuevo[f][c] = ESTADOS_CASILLAS.TOCADO;
    } else {
      nuevo[f][c] = ESTADOS_CASILLAS.AGUA;
      setTurnoMio(false);
    }
    setTableroEnemigo(nuevo);
  };

  if (cargando) return <div style={{color: 'white'}}>Cargando flota...</div>;

  return (
    <div style={{ padding: '20px', color: 'white', textAlign: 'center' }}>
      <button onClick={alSalir} style={estiloBotonSalir}>← ABORTAR</button>
      
      <h2>MODO PRIVADO: {tamano}x{tamano}</h2>
      <p>{turnoMio ? "TU TURNO" : "TURNO ENEMIGO"}</p>

      <div style={{ display: 'flex', gap: '50px', justifyContent: 'center', marginTop: '20px' }}>
    
        <div>
          <h3>Tu Flota</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${tamano}, 30px)`, //para que quepan las celdas
            gap: '2px' 
          }}>
            {tableroMio.map((fila, f) => fila.map((celda, c) => (
              <Celda key={`m-${f}-${c}`} valor={celda} esIA={false} />
            )))}
          </div>
        </div>

    
        <div>
          <h3>Océano Enemigo</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${tamano}, 30px)`, 
            gap: '2px' 
          }}>
            {tableroEnemigo.map((fila, f) => fila.map((celda, c) => (
              <Celda 
                key={`e-${f}-${c}`} 
                valor={celda} 
                esIA={true} 
                alClickar={() => disparar(f, c)} 
              />
            )))}
          </div>
        </div>
      </div>
    </div>
  );
}

const estiloBotonSalir = {
  position: 'absolute', top: '20px', left: '20px', background: '#ef4444', 
  color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer'
};

export default JuegoPrivada;