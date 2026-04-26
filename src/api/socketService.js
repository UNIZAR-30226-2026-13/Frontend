import { io } from 'socket.io-client';

const SOCKET_URL = "http://localhost:3000"; 

class SocketService {
  constructor() {
    this.socket = null;
  }

  conectar() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL);
    }
  }

  desconectar() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  unirsePartida(salaId) {
    if (this.socket) this.socket.emit('unirse_partida', salaId);
  }

  //listeners

  onPartidaLista(callback) {
    if (this.socket) {
        this.socket.off('partida_lista'); 
        this.socket.on('partida_lista', callback);
    }
  }

  onRecibirDisparo(callback) {
    if (this.socket) {
        this.socket.off('recibir_disparo');
        this.socket.on('recibir_disparo', callback);
    }
  }

  onActualizarTableros(callback) {
    if (this.socket) {
        this.socket.off('actualizar_tableros');
        this.socket.on('actualizar_tableros', callback);
    }
  }

  //escuchar cuando el rival ha terminado de colocar sus barcos
  onRivalListo(callback) {
      if(this.socket) {
          this.socket.off('rival_listo');
          this.socket.on('rival_listo', callback);
      }
  }

  //emits

  enviarTablero(salaId, tablero) {
      if (this.socket) this.socket.emit('tablero_listo', { salaId, tablero });
  }

  enviarResultadoDisparo(datos) {
    if (this.socket) this.socket.emit('resultado_disparo', datos);
  }

  disparar(salaId, f, c) {
    if (this.socket) this.socket.emit('realizar_disparo', { salaId, f, c });
  }
  
  getId() {
      return this.socket ? this.socket.id : null;
  }
}

const socketService = new SocketService();
export default socketService;