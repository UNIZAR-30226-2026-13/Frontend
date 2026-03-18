function Registro({alVolverInicio}){
    return(
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100vw',
          height: '100vh',
          background: '#1a1a1a',
          color: 'white',
          gap: '20px'
        }}>
          <h1 style={{fontSize: '50px', color: '#ffffff', marginBottom: '40px'}}>
            HUNDE LA FLOTA 
          </h1>
          <h2 style={{ color: '#ffffff', fontSize: '14px', marginBottom: '40px' }}>
            Crea tu cuenta
          </h2>
            <button
              onClick={alVolverInicio}
              style={{ padding: '15px 40px',
                fontSize: '20px',
                fontWeight: 'bold',
                background: '#ffffff',
                color: '#080808',
                border: '2px solid #555',
                borderRadius: '10px',
                cursor: 'pointer',
                width: '300px',
                transition: 'all 0.3s',
                marginBottom: '20px'
              }}>
                Crear cuenta
            </button>
            
            <span onClick={alVolverInicio} style={{color: 'white', cursor: 'pointer', transition: 'all 0.3s'}}>
              ¿No tienes cuenta? Regístrate
            </span>
        </div>
    );
}

export default Registro;