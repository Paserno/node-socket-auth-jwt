const url = ( window.location.hostname.includes('localhost') )
            ? 'http://localhost:8081/api/auth/'
            : '';

let usuario = null;
let socket  = null;

// Referencias HTML
const txtUid     = document.querySelector('#txtUid');
const txtMensaje = document.querySelector('#txtMensaje');
const ulUsuario  = document.querySelector('#ulUsuario');
const ulMensaje  = document.querySelector('#ulMensaje');
const btnSalir   = document.querySelector('#btnSalir');




// Validar el token del localStorage
const validarJWT = async() =>{

    const token = localStorage.getItem('token') || '';

    if( token.length <= 10){
        window.location = 'index.html';
        throw new Error('No hay token en el servidor');
    }

    const resp = await fetch( url, {
        headers: { 'x-token': token }
    });

    const { usuario: userDB, token:  tokenDB } = await resp.json();
    localStorage.setItem('token', tokenDB);
    usuario = userDB;
    document.title = usuario.nombre;

    await conectarSocket();
}

const conectarSocket = async() => {

    socket = io({
        'extraHeaders': {
            'x-token': localStorage.getItem('token')
        }
    });

    socket.on('connect', () => {
        console.log('Socket Online');
    });

    socket.on('disconnect', () => {
        console.log('Socket Offline');
    });

    socket.on('recibir-mensajes', () => {
        //TODO:
    });

    socket.on('usuarios-activos', (payload) => {
        console.log(payload);
        //TODO:
    });

    socket.on('mensaje-privado', () => {
        //TODO:
    })

}




const main = async() => {

    // Validar JWT
    await validarJWT();


}




main();