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

    // Limpiar cuando alguien se desconecte
    socket.on('disconnect', () => {
        chatMensaje.desconectarUsuario( usuario.id );
        io.emit('usuarios-activos', chatMensaje.usuariosArr)
    })
}


module.exports = {
    socketController
}