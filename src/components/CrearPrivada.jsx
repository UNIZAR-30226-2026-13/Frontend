import { useMemo, useState } from "react";
import { BARCOS, POWER_UPS } from "../constants/configuracion";

function CrearPrivada({ alEmpezar, alSalir}){
    const [tamano, setTamano] = useState(10); // lo dejamos por defecto la de 10x10
    const [powerupsCogidos, setPowerupsCogidos] = useState([]); // lista de los power ups cogidos
    const [numeroBarcos, setNumerBarcos] = useState({por: 1, aco: 1, sub: 2, fra: 1}); // estado por defecto
    const [ratioPowerups, setRatioPowerups] = useState(10); // por defecto 10%

    // calcula el maximo numero de casillas permitidas para barcos (50%)
    const maxBarcosPermitidos = useMemo(() => {
        return Math.floor(tamano * tamano * 0.5)
    }, [tamano]);

    // calcula cuantas casillas ocupan los barcos
    const casillasBarcos = useMemo(() => {
        let total = 0;
        Object.values(BARCOS).forEach((barco) => {
            const cantidadElegida = numeroBarcos[barco.id] || 0;
            total += cantidadElegida * barco.tam;
        });
        return total;
    },[numeroBarcos]);

    // Cantidad de power ups en el tablero
    const numPowerups = useMemo(() => {
        const casillasTotales = tamano * tamano;
        return Math.max(1, Math.floor(casillasTotales * (ratioPowerups / 100)));
    },[tamano, ratioPowerups]);

    const listaPowerUps = (id) => {
        if (powerupsCogidos.includes(id)) {
            setPowerupsCogidos(powerupsCogidos.filter(p => p !== id)); // si esta en la lista ya lo borra 
        } else {
            setPowerupsCogidos([...powerupsCogidos, id]); // si no est añade el power up
        }
    };

    const cambiarCantidadBarco = (id, value) => {
        const cantidad = Math.max(0, parseInt(value, 10) || 0);
        setNumerBarcos(prev => ({...prev,[id]: cantidad}));
    };

    const partidaEsValida = casillasBarcos <= maxBarcosPermitidos;

    // con apis
    /*const CrearPartida = async () => {
        if(partidaEsValida){
            try{const res = await fetch('/api/',{
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({}),
            });
            if (res.status === 200){
              const data = await res.json();
              setCargando(false);
              alAcceder(data.id ?? usuario);
            } else if ( res.status === 453){
              setError('Usuario o contraseña incorrecta');
              setCargando(false);
            } else{
              setError('Error del servidor');
              setCargando(false);
            }
        
        }else{
            return;
        }
    }*/

    return(
        <div style={{
          paddding: '20px',
          color: 'white',
          background: '#1a1a1a',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>

          <h2 style={{ fontSize: '32px', marginBottom: '40px' }}>Crear Partida Privada</h2>

          <div style={{ 
            marginBottom: '0px', 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            alignItems: 'center', 
            width: '100%', 
            gap: '30px' 
          }}>

            
            {/* Col izquiedra*/}  
            <div style={{ 
                background: '#222', 
                padding: '20px', 
                borderRadius: '15px', 
                border: '1px solid #333',
                marginLeft: '30px',
                height: '90%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
            <div style={{
              marginBottom: '40px',
              width: '100%',
              maxWidth: '500px',
              textAlign: 'center',
              alignItems: 'center'
            }}>
              <p style={{ color: '#aaa',fontSize:'30px', marginBottom: '20px', textAlign: 'center', fontWeight: 'bold'}}>
                CONFIGURACION BARCOS    
              </p>
              <div style={{
                marginBottom: '12px',
                textAlign: 'center',
                color: partidaEsValida ? '#aaa' : '#ef4444'
              }}>
                Casillas usadas: {casillasBarcos} / {maxBarcosPermitidos}
              </div>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr',
                    gap: '15px',
                    alignItems: 'center'
                }}>
                  <span style={{ color: '#aaa', fontSize: '12px' }}>TIPO DE BARCO</span>
                  <span style={{ color: '#aaa', fontSize: '12px', textAlign: 'center' }}>CANTIDAD</span>
                  <span style={{ color: '#aaa', fontSize: '12px', textAlign: 'center' }}>CASILLAS</span>

                  {Object.values(BARCOS).map((barco) => (
                    <div key={barco.id} 
                      style={{ display: 'contents' }}>

                      <div style={{ fontWeight: 'bold' }}>
                          {barco.nombre} 
                        <span style={{ color: '#aaa', fontWeight: 'normal', padding: '4px' }}>
                          ({barco.tam})
                        </span>
                      </div>
                    
                      <input 
                        type="number" 
                        min="0" 
                        value={numeroBarcos[barco.id] || 0} 
                        onChange={(e) => cambiarCantidadBarco(barco.id, e.target.value)} 
                        style={{
                          padding: '8px', 
                          borderRadius: '5px', 
                          border: '1px solid #444', 
                          background: '#111', 
                          color: 'white', 
                          textAlign: 'center' 
                        }}/>
                      <div style={{ textAlign: 'center', color: '#ffffff' }}>
                        {(numeroBarcos[barco.id] || 0) * barco.tam}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              </div>

            {/* Col derecha*/}
            <div style={{ 
                background: '#222', 
                padding: '20px', 
                borderRadius: '15px', 
                border: '1px solid #333',
                marginRight: '30px',
                height: '90%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                {/*tamaño */}
                <p style={{ color: '#aaa', marginBottom: '10px', textAlign: 'center' }}>TAMAÑO DEL TABLERO</p>
                <div style={{ 
                    fontSize: '48px', 
                    fontWeight: 'bold', 
                    color: '#ffffff', 
                    marginBottom: '20px',
                    textAlign: 'center',
                    alignItems: 'center',
                    width: '100%' 
                }}>
                    {tamano} x {tamano}
                </div>
                <input 
                  type="range" 
                  min="6" 
                  max="25" 
                  value={tamano} 
                  onChange={(e) => setTamano(parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    display: 'block',
                    margin: '0 auto',
                    accentColor: '#00ff00'
                  }}/>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  width: '100%', 
                  marginTop: '10px', 
                  color: '#aaa', 
                  fontSize: '14px'
                }}>
                <span>Min: 6</span>
                <span>Max: 25</span>
                </div>
                
                {/*power ups */}
              <div style={{ 
                marginBottom: '30px', 
                width: '100%',
                maxWidth: '600px',
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                textAlign: 'center',
                gap: '20px' 
              }}>
              
                <p style={{ color: '#aaa', marginBottom: '10px', fontSize: '14px', textAlign: 'center' }}>
                  RATIO DE POWERUPS: {ratioPowerups}%
                </p>
                <input 
                  type="range" 
                  min="0" 
                  max="30" 
                  value={ratioPowerups} 
                  onChange={(e) => setRatioPowerups(parseInt(e.target.value))} 
                  style={{
                    width: '100%',
                    display: 'block',
                    margin: '0 auto',
                    accentColor: '#00ff00'
                  }}/>
              </div>

              <div style={{ 
                display: 'flex', 
                gap: '10px', 
                justifyContent: 'center', 
                flexWrap: 'wrap' 
              }}>
                {Object.values(POWER_UPS).map((power) => (
                <div key={power.id} 
                  onClick={() => listaPowerUps(power.id)} 
                  style={{ 
                    padding: '10px 18px', 
                    borderRadius: '8px', 
                    cursor: 'pointer', 
                    transition: '0.3s', 
                    fontWeight: 'bold', 
                    fontSize: '13px',
                    background: powerupsCogidos.includes(power.id) ? '#ffffff' : '#222',
                    color: powerupsCogidos.includes(power.id) ? '#000' : '#fff',
                    border: powerupsCogidos.includes(power.id) ? '2px solid #00ff00' : '2px solid #444'
                  }}>
                    {power.nombre}
                </div>
                ))}
              </div>
            
          </div>
          </div>
          
                    

          <button 
            onClick={() => alEmpezar({ tamano, numeroBarcos, powerupsCogidos, ratioPowerups, numPowerups })}
            style={{
              padding: '20px 60px',
              background: '#00ff00',
              color: 'black',
              border: 'none',
              borderRadius: '10px',
              fontSize: '20px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginTop: '40px'
            }}>
              EMPEZAR PARTIDA PRIVADA
          </button>
          <button 
          onClick={alSalir} 
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: '#ef4444', 
            color: 'white', 
            border: 'none', 
            padding: '10px 20px', 
            borderRadius: '5px', 
            cursor: 'pointer',
            fontWeight: 'bold'
          }}>
            ← Salir al Menú
          </button>
    </div>
  );
}

export default CrearPrivada;