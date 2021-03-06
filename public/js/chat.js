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

    socket.on('recibir-mensajes', dibujarMensajes);
    socket.on('usuarios-activos', dibujarUsuario);

    socket.on('mensaje-privado', (payload) => {
        console.log('Privado:', payload)
    })

}

const dibujarUsuario = ( usuarios = [] ) =>{

    let usersHtml = '';
    usuarios.forEach( ({ nombre, uid }) => {

        usersHtml += `
        <li class="text-success">
            <p>
                <h5 class="text-success"> ${ nombre } </h5>
                <span class="fs-6 text-muted">${ uid }</span>
            </p>
        </li>
        `;
    });

    ulUsuario.innerHTML = usersHtml;
}

const dibujarMensajes = ( mensajes = [] ) =>{

    let mensajeHtml = '';
    mensajes.forEach( ({ nombre, mensaje }) => {

        mensajeHtml += `
        <li >
            <p>
                <span class="text-primary"> ${ nombre } </span>
                <span>${ mensaje }</span>
            </p>
        </li>
        `;
    });

    ulMensaje.innerHTML = mensajeHtml;
}

txtMensaje.addEventListener('keyup', ({ keyCode }) => {

    const mensaje = txtMensaje.value;
    const uid     = txtUid.value;
    
    if( keyCode !== 13 ){ return; }
    if( mensaje.length === 0 ){ return; }

    socket.emit('enviar-mensaje', { mensaje, uid });
    txtMensaje.value = '';
});

btnSalir.addEventListener('click', (ev)=> {
    window.location = '/';
    localStorage.clear();
})

const main = async() => {

    // Validar JWT
    await validarJWT();


}




main();