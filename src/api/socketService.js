import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

class SocketService {
  constructor() {
    this.socket = null;
  }

  conectar() {
    console.log('Connecting to socket at:', SOCKET_URL);
    if (!this.socket) {
      const token = localStorage.getItem('authToken');
      console.log('Auth token found:', token ? 'yes' : 'no');

      this.socket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ['polling', 'websocket'],
        auth: token ? { token } : undefined
      });

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket.id);
      });

      this.socket.on('connect_error', (error) => {
        console.log('Socket connection error:', error);
      });
    }
  }

  desconectar() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  //emits

  unirseSalaPrivada() {
    if (this.socket) this.socket.emit('join_room');
  }

  //listeners

  onPartidaEncontrada(callback) {
    if (this.socket) {
        this.socket.off('partidaEncontrada');
        this.socket.on('partidaEncontrada', callback);
    }
  }

  onColocaBarcos(callback) {
    if (this.socket) {
        this.socket.off('coloca_barcos');
        this.socket.on('coloca_barcos', callback);
    }
  }

  onGuestConectado(callback) {
    if (this.socket) {
        this.socket.off('guest_conectado');
        this.socket.on('guest_conectado', callback);
    }
  }

  onTuTurno(callback) {
      if(this.socket) {
          this.socket.off('tu_turno');
          this.socket.on('tu_turno', callback);
      }
  }

  onActualizarEstado(callback) {
      if(this.socket) {
          this.socket.off('actualizar_tablero');
          this.socket.on('actualizar_tablero', callback);
      }
  }

  onPartidaFinalizada(callback) {
      if(this.socket) {
          this.socket.off('partida_finalizada');
          this.socket.on('partida_finalizada', callback);
      }
  }

  getId() {
      return this.socket ? this.socket.id : null;
  }
}

const socketService = new SocketService();
export default socketService;