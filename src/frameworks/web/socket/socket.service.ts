import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';

export class SocketService {
  private static instance: SocketService;
  private io: SocketServer | null = null;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public initialize(server: HttpServer): void {
    this.io = new SocketServer(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    this.io.on('connection', (socket) => {
      console.log('Cliente conectado:', socket.id);

      // Unirse a una sala específica para recibir actualizaciones de una orden específica
      socket.on('subscribe', (roomId: string) => {
        socket.join(roomId);
        console.log(`Cliente ${socket.id} se unió a la sala: ${roomId}`);
      });

      // Dejar una sala específica
      socket.on('unsubscribe', (roomId: string) => {
        socket.leave(roomId);
        console.log(`Cliente ${socket.id} dejó la sala: ${roomId}`);
      });

      socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
      });
    });

    console.log('Servidor de WebSockets inicializado');
  }

  public emitToRoom(room: string, event: string, data: any): void {
    if (this.io) {
      this.io.to(room).emit(event, data);
      console.log(`Evento '${event}' emitido a la sala '${room}'`);
    }
  }

  public emitToAll(event: string, data: any): void {
    if (this.io) {
      this.io.emit(event, data);
      console.log(`Evento '${event}' emitido a todos los clientes`);
    }
  }
}

export default SocketService.getInstance(); 