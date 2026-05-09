const API_URL = 'http://localhost:3000/api';

const fetchConfig = (method, body = null) => {
    const config = {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    };
    if (body) {
        config.body = JSON.stringify(body);
    }
    return config;
};

class ApiService {
    //colas y emparejamiento
    async buscarPartida(idJugador) {
        const res = await fetch(`${API_URL}/queue/join`, fetchConfig('POST', { IDjugador: idJugador }));
        return res.json();
    }

    async estadoBusqueda(idJugador) {
        const res = await fetch(`${API_URL}/queue/status?IDjugador=${idJugador}`, fetchConfig('GET'));
        return res.json();
    }

    //gestion de partida activa
    async colocarBarcos(partidaId, barcos) {
        const res = await fetch(`${API_URL}/partida/${partidaId}/barcos`, fetchConfig('POST', { barcos }));
        return res;
    }

    async obtenerEstadoPartida(partidaId) {
        const res = await fetch(`${API_URL}/partida/${partidaId}/status`, fetchConfig('GET'));
        return res.json();
    }

    async enviarMovimiento(partidaId, fila, columna, tipo = "disparo", boostType = "None") {
        const body = { type: tipo, f: fila, c: columna, boostType };
        const res = await fetch(`${API_URL}/partida/${partidaId}/movimiento`, fetchConfig('PUT', body));
        return res; 
    }

    //partida privada
    async crearPartidaPrivada(configuracion) {
        const res = await fetch(`${API_URL}/partida/crear`, fetchConfig('POST', configuracion));
        return res.json();
    }

    async unirsePartidaPrivada(partidaId) {
        const res = await fetch(`${API_URL}/partida/join/${partidaId}`, fetchConfig('POST'));
        return res; 
    }

    //perfil e historial
    async obtenerPerfil(username) {
        const res = await fetch(`${API_URL}/usuario/${username}`, fetchConfig('GET'));
        return res; // 200 con datos o 404 no encontrado
    }

    async editarPerfil(datos) {
        const res = await fetch(`${API_URL}/usuario/configuracion`, fetchConfig('PUT', datos));
        return res; 
    }

    async obtenerHistorialJugador(idJugador) {
        const res = await fetch(`${API_URL}/terminadas/${idJugador}`, fetchConfig('GET'));
        return res.json();
    }
}

const apiService = new ApiService();
export default apiService;