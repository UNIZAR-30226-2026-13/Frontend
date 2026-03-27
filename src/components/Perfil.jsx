import { useState } from "react"
import IconoDefault from '../assets/IconoDefault.png'
function Perfil({ alSalir, usuario }){
    const[pantalla, setPantalla] = useState('PERFIL');

    return(
        <div style={{
          display: 'flex',
          width: '100vw',
          height: '100vh',
          background: '#1a1a1a',
          color: 'white',
          overflow: 'hidden'
        }}>
          
          {/*Barra lateral*/}
          <div style={{
            display: 'flex',
            width: '200px',
            height:'100vh',
            background: '#080808',
            borderRight: '2px solid #333',
            flexDirection: 'column',
            padding: '10px',
            boxSizing: 'border-box'
          }}>
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center', 
              gap: '8px', 
              padding: '20px', 
              borderBottom: '1px solid #333' 
            }}>
              <div style={{
                width: '60px', 
                height: '60px', 
                borderRadius: '50%',
                background: '#555', 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center', 
                fontSize: '28px',
                overflow: 'hidden'
              }}>
                <img 
                  src={IconoDefault} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
               />
              </div>
              <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{usuario || 'Jugador'}</span>
            </div>

            {['PERFIL', 'AJUSTES'].map(pant => (        // array de pantallas
              <div
                key={pant}
                onClick={() => setPantalla(pant)}
                style={{
                  padding: '16px 24px',
                  cursor: 'pointer',
                  background: pantalla === pant ? '#333' : 'transparent',   //
                  borderLeft: pantalla === pant ? '3px solid white' : '3px solid transparent', //borde balnquito
                  fontSize: '15px',
                  fontWeight: pantalla === pant ? 'bold' : 'normal'  //negrita o no
                  
                }}>
                {pant}
              </div>
            ))}

            <button
              onClick={alSalir}
              style={{
                marginTop: 'auto',
                padding: '15px',
                fontSize: '15px',
                fontWeight: 'bold',
                background: '#ffffff',
                color: '#080808',
                border: '2px solid #555',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}>
                ← Salir al Menú
            </button>
          </div>

          <div style={{
            flex: 1,
            padding: '40px',  
            overflowY: 'auto',
            height: '100vh'
          }}>
            {pantalla === 'PERFIL' && <PantallaPerfil usuario={usuario} />}
            {pantalla === 'AJUSTES' && <PantallaAjustes  />}

        </div>
      </div>
    )
}

function PantallaPerfil({ usuario }) {
  return (
    <div style={{ display: 'flex', 
      flexDirection: 'column', 
      gap: '40px' 
    }}>
 
      {/*foto y datos */}
      <div style={{
        display: 'flex', 
        gap: '40px'
      }}>
 
        <div style={{ display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '12px' 
          }}>
          <p style={{ margin: 0, color: '#ffffff', fontSize: '14px' }}>Foto de usuario</p>
          <div style={{
            width: '300px', 
            height: '300px', 
            borderRadius: '50px',
            background: '#333', 
            border: '2px solid #555',
            color: '#555',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '60px',
            overflow: 'hidden'
          }}>
            <img 
              src={IconoDefault} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              alt="Perfil" 
            />
          </div>
        </div>
 
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '20px', 
          flex: 1               // asi ocupa el tamaño restante
        }}>
          <div>
            <p style={{ margin: '8px', color: '#ffffff', fontSize: '14px' }}>Nombre de usuario</p>
            <div style={{
              padding: '12px', 
              background: '#333',
              border: '2px solid #555', 
              borderRadius: '10px', 
              fontSize: '16px'
            }}>
              {usuario || 'Jugador'}
            </div>
            <p style={{ margin: '8px', color: '#555', fontSize: '12px', cursor: 'pointer' }}>
              Cambiar nombre de usuario {/* API */}
            </p>
          </div>
 
          <div>
            <p style={{ margin: '8px', color: '#ffffff', fontSize: '14px' }}>Correo electrónico</p>
            <div style={{
              padding: '20px', 
              background: '#333',
              border: '2px solid #555', 
              borderRadius: '10px', 
              fontSize: '16px', 
              color: '#555'
            }}>
              {/* API */}
            </div>
          </div>
 
          <div>
            <p style={{ margin: '8px', color: '#ffffff', fontSize: '14px' }}>ELO</p>
            <div style={{
              padding: '12px', 
              background: '#333',
              border: '2px solid #555', 
              borderRadius: '10px', 
              fontSize: '16px', 
              color: '#555'
            }}>
              1000 {/* API */}
            </div>
          </div>
        </div>
      </div>
 
      <div>
        <p style={{ margin: '12px', color: '#ffffff', fontSize: '14px' }}>Estadísticas</p>
        <div style={{
          background: '#333', 
          border: '2px solid #555', 
          borderRadius: '10px',
          padding: '30px', 
          minHeight: '200px',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center'
        }}>
          {/* API*/}
          <p style={{ color: '#555', fontSize: '14px' }}>Sin partidas</p>
        </div>
      </div>
 
    </div>
  );
}

function PantallaAjustes({}){
    return(
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%' 
      }}>
        <p style={{ color: '#555', fontSize: '18px' }}>
            AJUSTES
        </p>
      </div>
  );
}

export default Perfil;