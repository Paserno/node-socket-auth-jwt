const { comprobarJWT } = require("../helpers");
const { ChatMensaje } = require("../models");

const chatMensaje = new ChatMensaje


const socketController = async( socket, io ) => {

    const usuario = await comprobarJWT(socket.handshake.headers['x-token']);
    if( !usuario ){
        return socket.disconnect();
    }

    // Agregar el usuario conectado
    chatMensaje.conectarUsuario( usuario );
    io.emit('usuarios-activos', chatMensaje.usuariosArr);
    socket.emit('recibir-mensajes', chatMensaje.ultimos10);

    // Limpiar cuando alguien se desconecte
    socket.on('disconnect', () => {
        chatMensaje.desconectarUsuario( usuario.id );
        io.emit('usuarios-activos', chatMensaje.usuariosArr)
    })

    socket.on('enviar-mensaje', ({ uid, mensaje }) =>{
        
        chatMensaje.enviarMensaje(usuario.id, usuario.nombre, mensaje);
        io.emit('recibir-mensajes', chatMensaje.ultimos10);
    })
}


module.exports = {
    socketController
}