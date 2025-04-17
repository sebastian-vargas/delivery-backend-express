import { NotificacionService } from '../../../frameworks/services/notificacion.service';
import { IUsuarioRepository } from '../../repositories/usuario.repository.interface';

export interface NotificarCreacionOrdenDTO {
  id_usuario: number;
  id_orden: number;
}

export class NotificarCreacionOrdenUseCase {
  constructor(
    private notificacionService: NotificacionService,
    private usuarioRepository: IUsuarioRepository
  ) {}
  
  async execute(data: NotificarCreacionOrdenDTO): Promise<void> {
    const { id_usuario, id_orden } = data;
    
    // Buscar información del usuario
    const usuario = await this.usuarioRepository.findById(id_usuario);
    
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    
    // Enviar notificaciones
    await this.notificacionService.notificarCreacionOrden(
      id_usuario,
      usuario.email,
      usuario.telefono,
      id_orden
    );
  }
} 