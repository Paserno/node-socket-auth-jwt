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

    // Concecarlo a una sala especial 
    socket.join( usuario.id ); // global, socket.id, usuario.id


    // Limpiar cuando alguien se desconecte
    socket.on('disconnect', () => {
        chatMensaje.desconectarUsuario( usuario.id );
        io.emit('usuarios-activos', chatMensaje.usuariosArr)
    })

    socket.on('enviar-mensaje', ({ uid, mensaje }) =>{
        
        if ( uid ) {
            // Mensaje privado
            socket.to( uid ).emit('mensaje-privado',{ de: usuario.nombre, mensaje });
        }else{
            chatMensaje.enviarMensaje(usuario.id, usuario.nombre, mensaje);
            io.emit('recibir-mensajes', chatMensaje.ultimos10);
        }
    })
}


module.exports = {
    socketController
}