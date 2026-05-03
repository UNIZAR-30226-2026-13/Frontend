import { ESTADOS_CASILLAS } from '../constants/configuracion';
import imgAgua from '../assets/agua.png';

// barcos horizontal
import sub_default  from '../assets/submarino_default.png';
import sub_militar  from '../assets/submarino_militar.png';
import sub_dorado   from '../assets/submarino_dorado.png';
import sub_fantasma from '../assets/submarino_fantasma.png';

import por_default  from '../assets/portaviones_default.png';
import por_militar  from '../assets/portaviones_militar.png';
import por_dorado   from '../assets/portaviones_dorado.png';
import por_fantasma from '../assets/portaviones_fantasma.png';

import aco_default  from '../assets/acorazado_default.png';
import aco_militar  from '../assets/acorazado_militar.png';
import aco_dorado   from '../assets/acorazado_dorado.png';
import aco_fantasma from '../assets/acorazado_fantasma.png';

import fra_default  from '../assets/fragata_default.png';
import fra_militar  from '../assets/fragata_militar.png';
import fra_dorado   from '../assets/fragata_dorado.png';
import fra_fantasma from '../assets/fragata_fantasma.png';

// barcos en vertical
import sub_default_v  from '../assets/submarino_default_v.png';
import sub_militar_v  from '../assets/submarino_militar_v.png';
import sub_dorado_v   from '../assets/submarino_dorado_v.png';
import sub_fantasma_v from '../assets/submarino_fantasma_v.png';

import por_default_v  from '../assets/portaviones_default_v.png';
import por_militar_v  from '../assets/portaviones_militar_v.png';
import por_dorado_v   from '../assets/portaviones_dorado_v.png';
import por_fantasma_v from '../assets/portaviones_fantasma_v.png';

import aco_default_v  from '../assets/acorazado_default_v.png';
import aco_militar_v  from '../assets/acorazado_militar_v.png';
import aco_dorado_v   from '../assets/acorazado_dorado_v.png';
import aco_fantasma_v from '../assets/acorazado_fantasma_v.png';

import fra_default_v  from '../assets/fragata_default_v.png';
import fra_militar_v  from '../assets/fragata_militar_v.png';
import fra_dorado_v   from '../assets/fragata_dorado_v.png';
import fra_fantasma_v from '../assets/fragata_fantasma_v.png';

const IMAGENES = {
  default:  { por: por_default,  aco: aco_default,  sub: sub_default,  fra: fra_default  },
  militar:  { por: por_militar,  aco: aco_militar,  sub: sub_militar,  fra: fra_militar  },
  dorado:   { por: por_dorado,   aco: aco_dorado,   sub: sub_dorado,   fra: fra_dorado   },
  fantasma: { por: por_fantasma, aco: aco_fantasma, sub: sub_fantasma, fra: fra_fantasma },
};

const IMAGENES_V = {
  default:  { por: por_default_v,  aco: aco_default_v,  sub: sub_default_v,  fra: fra_default_v  },
  militar:  { por: por_militar_v,  aco: aco_militar_v,  sub: sub_militar_v,  fra: fra_militar_v  },
  dorado:   { por: por_dorado_v,   aco: aco_dorado_v,   sub: sub_dorado_v,   fra: fra_dorado_v   },
  fantasma: { por: por_fantasma_v, aco: aco_fantasma_v, sub: sub_fantasma_v, fra: fra_fantasma_v },
};

function Celda({ valor, alClickar, esIA, estaEnSombra, alEntrar }) {
  const tipo = valor?.tipo ?? valor;
  const esBarcoObj = typeof valor === 'object' && (
    valor?.tipo === ESTADOS_CASILLAS.BARCO ||
    valor?.tipo === ESTADOS_CASILLAS.TOCADO ||
    valor?.tipo === ESTADOS_CASILLAS.HUNDIDO
  );
  const skinActual = localStorage.getItem('skin') || 'militar';

  const obtenerOverlay = () => {
    if (estaEnSombra)                       return 'rgba(59, 130, 246, 0.4)';
    if (tipo === ESTADOS_CASILLAS.TOCADO)   return 'rgba(239, 68, 68, 0.3)';
    if (tipo === ESTADOS_CASILLAS.HUNDIDO)  return 'rgba(0, 0, 0, 0.80)';
    if (tipo === ESTADOS_CASILLAS.ESCUDO)   return 'rgba(15, 183, 234, 0.35)';
    if (tipo === ESTADOS_CASILLAS.AGUA)     return 'rgba(59, 130, 246, 0.45)';
    return 'transparent';
  };

  return (
    <div
      onClick={alClickar}
      onMouseEnter={alEntrar}
      style={{
        width: '40px',
        height: '40px',
        border: '1px solid #1a3a4a',
        backgroundImage: `url(${imgAgua})`,
        backgroundSize: 'cover',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',        
        transition: '0.2s',
        boxShadow: estaEnSombra ? 'inset 0 0 10px #3b82f6' : 'none'
      }}
    >
      {esBarcoObj && !esIA && ( 
        <img
          src={
            valor.orientacion === 'V' ? IMAGENES_V[skinActual]?.[valor.barcoId] : IMAGENES[skinActual]?.[valor.barcoId]     //horizontal
          }
          alt=""
          style={{
            position: 'absolute',
            left: valor.orientacion === 'H' ? `${-valor.indice * 44}px` : '0px',
            top:  valor.orientacion === 'V' ? `${-valor.indice * 44}px` : '0px',
            width:  valor.orientacion === 'H' ? `${valor.total * 44}px` : '44px',
            height: valor.orientacion === 'V' ? `${valor.total * 44}px` : '44px',
            objectFit: 'fill',  // para que ocupe todo
            pointerEvents: 'none',  
            zIndex: 1,
          }}
        />
      )}

      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: obtenerOverlay(),
        zIndex: 2,
        transition: 'background-color 0.2s'
      }} />

      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {tipo === ESTADOS_CASILLAS.TOCADO  && <span style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>✕</span>}
        {tipo === ESTADOS_CASILLAS.HUNDIDO && <span style={{ fontSize: '18px' }}>💀</span>}
        {tipo === ESTADOS_CASILLAS.ESCUDO  && <span style={{ fontSize: '22px' }}>🛡️</span>}
        {!esIA && tipo === ESTADOS_CASILLAS.MINA && <span style={{ fontSize: '18px' }}>💣</span>}
      </div>
    </div>
  );
}

export default Celda;