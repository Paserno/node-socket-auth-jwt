> __Elemento Anterior 馃憖:__ __[Aplicaci贸n de Ticket con Socket.io](https://github.com/Paserno/node-socket-ticket)__
#
# Socket con Autenticaci贸n con JWT
Reutilizaci贸n del RestServer y agregar contenido de Socket.io, validando los socket con JWT, ademas de envio de mensajes con Socket. Utilizamos los siguientes elementos: 

* __[REST Server con Node.js y Express](https://github.com/Paserno/node-express-restserver-fst)__
* __[Socket.io](https://www.npmjs.com/package/socket.io)__ - [Pagina Oficial](https://socket.io/docs/v4/)

#
Para reconstruir los modulos de node ejecute el siguiente comando.

````
npm install
````

# 
### 1.- Primeros pasos - Configuraci贸n
Reutilizamos el RestServer, instalamos las dependencias y buscamos las variables de entorno, luego realizamos la instalaci贸n de __Socket.io__

En `models/server.js`
* Configuramos el servidor en base a la documentaci贸n de __Socket.io__, agregamos esos elementos en el constructor de la clase `Server`.
````
this.server = require('http').createServer(this.app);
this.io = require('socket.io')(this.server);
````
* En el metodo `listen()` cambiamos `this.app` por `this.server` para que soporte __socket.io__ nuestra aplicaci贸n.
````
listen() {
        this.server.listen(this.port, () => {
            console.log('Servidor corriendo en el puerto', this.port);
        });
    }
````
* Creamos un nuevo metodo llamado `sockets()` y lo ponemos en el constructor, esto nos servir谩 para conectar a los diferentes clientes.
* Importamos la funci贸n `socketController()` que crearemos a continuaci贸n.
````
sockets(){
        this.io.on('connection', socketController);
    }
````
En `sockets/controller.js`
* Creamos el controlador de socket que es utilizado en la clase `Server`.
* Mandamos un `console.log` que un nuevo cliente se conecto, para comprobar la conexi贸n que se har谩 en el __Frontend__.
````
const socketController = ( socket ) => {

    console.log('cliente conectado', socket.id );
}
````
* Exportamos la funci贸n.
````
module.exports = {
    socketController
}
````
Cremoas en `public/`:
* El archivo `chat.html`.
* La console.logcarpeta con el archivo `js/chat.js`.

En `public/chat.html`
* Importamos en el HTML socket.io y el archivo `chat.js`.
````
<script src="./socket.io/socket.io.js"></script>
<script src="./js/chat.js"></script>
````

En `public/js/chat.js`
* Agregamos esto propio de Socket.io para el cliente, esto har谩 que se conecte al servidor de socket y de esta manera la consola detectar谩 un nuevo cliente en el __Backend__.
````
const socket = io();
````
#
### 2.- Dise帽o de login y su funcionamiento - Frontend
Extraemos el codigo que teniamos en el html sobre el boton de Google sign-in, para agregarlo en su propio archivo `auth.js` que se creo, para hacer las validaciones

En `public/index.html`
* Creamos en el HTML unos `div` donde dejar el login manual.
* Creamos un form para almacenar unos textbox y un button con clases propias de boostrap _(boton con tipo submit)_.
````
<div class="col-sm-6">
        <h1>Login Manual</h1>
        <hr>

        <form class="d-grid ">
            <input type="text" name="correo" class="form-control mb-2" placeholder="Correo">
            <input type="text" name="password" class="form-control mb-2" placeholder="Contrase帽a">

            <button type="submit" class="btn btn-primary">
                Ingresar
            </button>

        </form>
</div>
````
En `public/js/auth.html`
* Hacemos referencia al form en el HTML.
* Creamos una constante con el URL de la aplicaci贸n, verificando si en la url se encuentra el localhost, en el caso que no se pondr谩 la URL donde se subir谩 el proyecto.
````
const miFormulario = document.querySelector('form');
const url = ( window.location.hostname.includes('localhost') )
            ? 'http://localhost:8081/api/auth/'
            : '';
````
* Creamos el evento submit en el form, usando `.preventDefautl()` para no recargar la pagina.
* Creamos una constante vac铆a, ademas de un for para leer todos los elementos del formulario, hacemos una condici贸n de que si no tiene `name` no se leer谩, en este caso no leer谩 el boton, si no que los 2 textbox.
* Posterior a esto hacemos un __POST__ con ayuda del __fetch__, le enviamos los elementos del `formData`.
* Realizamos 2 `.then`, el primero para entrar a la restpuesta `.json()` y la segunda promesa para treaer el mensaje y token, en el caso que venga el mensaje, se enviar谩 como un `console.warn`, en el caso que venga solo el token se guardar谩 en el `localStorage()`.
* En el caso que salga un error, lo recibimos en el `.catch`.
````
miFormulario.addEventListener('submit', ev => {
    ev.preventDefault();
    const formData = {};

    for( let el of miFormulario.elements ){
        if(el.name.length > 0)
            formData[el.name] = el.value
    }

    fetch( url + 'login',{
        method: 'POST',
        body: JSON.stringify( formData ),
        headers:{ 'Content-Type': 'application/json' }
    })
    .then( resp => resp.json())
    .then( ({msg, token}) => {
        if(msg){
            return console.warn( msg );
        }
        localStorage.setItem('token', token);
    })
    .catch( err => {
        console.log(err)
    })
});
````
* Aqu铆 solo copiamos el script que estaba en el HTML y en vez de mandar el URL completo, enviamos la constante que se creo, mas `google` que es la direcci贸n exacta del POST de __Google sing-in__
````
 function handleCredentialResponse(response) {

    const body = { id_token: response.credential }

    fetch( url + 'google' ,{
        method: 'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify(body)
    })
        .then( resp => resp.json())
        .then( ({token}) => {
            localStorage.setItem( 'token', token )
        })
        .catch(console.warn);
    }
````
#
### 3.- Renovar JWT - Servicio Backend
Es necesario tener un servicio para renovar el Token, para acceder a la aplicaci贸n, para eso se har谩 un nuevo endpoint GET

En `routes/auth.js`
* Importamos `validarJWT` y `renovarToken` del controlador de auth que se crear谩 a continuaci贸n.
* Creamos el endpoint get, ponemos el __Middleware__ de `validarJWT`, en el caso que no haya problema ejecutar谩 la funci贸n del controlador.
````
router.get('/', validarJWT, renovarToken );
````
En `controllers/auth.controllers.js`
* Creamos la nueva funci贸n `renovarToken()` asincrona.
* El __Middleware__ de `validarJWT` nos manda en la `req` el usuario, este hace una desencriptaci贸n del token, obteniendo el uid que es enviado y con la palabra secreta realiza la validaci贸n, en el caso que pase por las condiciones correctamente nos entregar谩 el usuario de ese uid. 
* Luego generamos un token nuevo con la funci贸n `generarJWT`, entregandole el id.
* Finalmente le pasamos al __Frontend__ el usuario con todos sus datos y el nuevo token.
````
const renovarToken = async( req, res = response ) => {
    const { usuario } = req;

    const token = await generarJWT( usuario.id );

    res.json({
        usuario,
        token
    })
}
````
#
### 4.- Validar Token - Frontend
Esta vez modificaremos el archivo llamado `chat.js` que se creo, esto ser谩 para la validaci贸n del token que se alojar谩 en el `localStorage`

En `public/js/chat.js`
* Inicializamos las variables que usaremos, como primero el __URL__, el usuario _(Tendra la informaci贸n del usuario autenticado)_ en null al igual que el socket _(Informaci贸n del socket)_.
````
const url = ( window.location.hostname.includes('localhost') )
            ? 'http://localhost:8081/api/auth/'
            : '';

let usuario = null;
let socket  = null;
````
* Creamos la funci贸n `validarJWT()` que validar谩 el token del localStorage.
* Primero obtenemos la informaci贸n del localStorage y lo almacenamos en una variable.
* Validamos el largo del Token en el caso que no sea igual a 10, nos madar谩 al `index.html` con un mensaje de error.
* Envaimos en una petici贸n __fetch__ al URL, para enviar en el `headers` el token.
* Recibimos la respuesta y desestructuramos en un objeto algunos elementos que recibiremos como el usuario y el token.
* Luego actualizamos el Token que tenemos en el `localStorage`.
* Finalmente le pasamos el contendo de `userDB` al usuario que estaba en `null`, para proximamente utilizarlo.
````
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
}
````
* Creamos la funci贸n main y colocamos nuestro validador de token.
* Y llamamos el `main()`.
````
const main = async() => {
    await validarJWT();
}
main();
````
#
### 4,5.- Correcci贸n de boton Sign-out de Google Sing-in - Frontend
Se corrigi贸 el error de que cuando apretabamos el boton de __Desconectar__ no se desvinculaba la cuenta de __Google__

En `public/js/auth.js`
* Ya que habiamos modificado el fetch, que solo recibiremos el __token__ en la segunda promesa, ahora se corrige y traemos al usuario tambien, para que en el boton como lo habiamos dejado, detecte el correo y lo elimine del `localStorage` como lo teniamos originalmente.
````
fetch( url + 'google', {
        method: 'POST',
        headers: {
            'Content-Type':'application/json'
        },
        body: JSON.stringify(body)
    })
        .then( r => r.json())
        .then( ({token, usuario}) => {
            localStorage.setItem( 'email', usuario.correo )
            localStorage.setItem( 'token', token )

        })
        .catch(console.warn);
````
Este error nace de que el boton de remover el localStorage, busca un campo llamado `email` y como no existia antes de este punto, no se podia cerrar la sesi贸n.
#
### 5.- Validar socket con JWT - Backend
Se crear谩n validadores en la parte del __Backend__, para poder aceptar el socket con ayuda del JWT

En `public/js/auht.js`
* Agregamos el siguiente codigo, en el evento del boton `submit`, especificamente en la segunda promesa.
* Ademas del fetch del Google Sign-in, en la segunda promesa.
````
window.location = 'chat.html';
````
En `public/js/chat.js`
* Creamos la funci贸n `conectarSocket()`
````
const conectarSocket = async() => {
    const socket = io({
        'extraHeaders': {
            'x-token': localStorage.getItem('token')
        }
    });
}
````
* Al final de la funci贸n `validarJWT()` llamamos a la nueva funci贸n recien creada, una vez que haya pasado todas las validaci贸nes se ejecutar谩.
````
await conectarSocket();
````
En `helpers/generar-jwt.js`, aqu铆 generamos el nuevo validador que se utilizar谩
* Importamos el modelo de usuario.
````
const { Usuario } = require('../models');
````
* Creamos un nuevo validador llamado `comprobarJWT()` asincrono, lo encerramos en un Try-Catch por si se presentan errores.
* Validamos el tama帽o del token que se manden por los parametros, en el caso que sea menor a 10, se retornar谩 un `null`.
* En el caso de tener un token correcto, se extraer谩 el uid, para luego buscar el usuario con ese id.
* En el caso que exista el usuario, se buscar谩 el que tenga el estado en `true`, en el caso contrari贸 se retornara `null`.
* Si se dispara un error se retornar谩 un `null` y finalmente importamos la funci贸n.
````
const comprobarJWT = async( token = '') => {

    try {
        
        if( token.length < 10){
            return null;
        }

        const { uid } = jwt.verify( token, process.env.JWT_KEY );
        const usuario = await Usuario.findById( uid );

        if ( usuario ) {
            if ( usuario.estado ) {
                return usuario;
            } else {
                return null;
            }
        }else {
            return null;
        }

    } catch (error) {
        return null;
    }
}
````
En `sockets/controller.js`
* Importamos el validador que creamos.
````
const { comprobarJWT } = require("../helpers");
````
* En nuestra funci贸n le mandamos el `x-token` que lo extraemos de `socket.handshake.headers`.
* Si no existe un token, se desconectar谩 el socket.
* En el caso que exista el token, mostrar谩 un mensaje por consola de que se conecto un usuario.
````
const socketController = async( socket ) => {

    const usuario = await comprobarJWT(socket.handshake.headers['x-token']);
    if( !usuario ){
        return socket.disconnect();
    }

    console.log('Se conecto', usuario.nombre);
}
````
#
### 6.- Preparando HTML y JS para chat - Frontend
Creamos elementos HTML con ayuda de las clases de boostrap, ademas de preparar socket que se emitiran desde el servidor.

En `public/chat.html`
* Creamos inputs para el uid y el mensaje, el espacio para el chat y usuarios conectados, finalmente creamos el boton, cada uno de estos elementos le agregamos un ID, para hacer referencia en el archivo JS.
````
  <div class="row mt-5">
        <div class="col-sm-6">
            <h3>Enviar Mensaje</h3>
            <hr>
            <input type="text"
                   id="txtUid"
                   class="form-control mb-2"
                   placeholder="uid"
                   autocomplete="off">

            <input type="text"
                   id="txtMensaje"
                   class="form-control mb-2"
                   placeholder="Mensaje"
                   autocomplete="off">

            <h3>Usuarios</h3>
            <hr>
            <ul id="ulUsuario">

            </ul>
        </div>

        <div class="col-sm-6">
            <h3>Chat Completo</h3>
            <hr>
            <ul id="ulMensaje">

            </ul>
        </div>
    </div>
    
    <button id="btnSalir" class="btn btn-outline-danger">
        Logout
    </button>
````

En `public/js/chat.js`
* Hacemos referencias a los IDs de los elementos creados en el HTML.
````
const txtUid     = document.querySelector('#txtUid');
const txtMensaje = document.querySelector('#txtMensaje');
const ulUsuario  = document.querySelector('#ulUsuario');
const ulMensaje  = document.querySelector('#ulMensaje');
const btnSalir   = document.querySelector('#btnSalir');
````
* En la funci贸n `conectarSocket()`, agregamos algunos socket, el de conectar, desconectar, recibir mensaje, usuarios activos y mensajes privados.
````
 socket.on('connect', () => {
        console.log('Socket Online');
    });

    socket.on('disconnect', () => {
        console.log('Socket Offline');
    });

    socket.on('recibir-mensajes', () => {
        //TODO:
    });

    socket.on('usuarios-activos', () => {
        //TODO:
    });

    socket.on('mensaje-privado', () => {
        //TODO:
    })
````
#
### 7.- Modelo para Chat - Usuarios Conectados y Mensajes
Creamos la clase que manejar谩 el chat de mensajes, ademas de crear el modelo de mensaje para definir la estructur que tendra

Creamos el archivo `models/chat.js`
* Creamos la clase que manejar谩 la esctructura de los mensajes con sus propiedades.
* El constructor que recibira como parametros el uid, nombre y mensaje.
````
class Mensaje {
    constructor( uid, nombre, mensaje ) {
         this.uid     = uid;
         this.nombre  = nombre;
         this.mensaje = mensaje;
    }
}
````
* Creamos la clase `ChatMensaje` con el constructor, que tendr谩 el parametro de mensajes como un arreglo y de usuarios que recibir谩 objetos. 
* Exportar la clase `ChatMensaje`.
````
class ChatMensaje {

    constructor() {

        this.mensajes = [];
        this.usuarios = {};
    }
    ...
}
````
* Creamos dos __Get__, el primero es de los ultimos 10 mensajes, estos los tendr谩 de la propiedad `this.mensaje`, el que con el metodo `.splice()` extraer谩 los primeros 10 elementos del arreglo y lo retornar谩.
* El segundo __Get__ `usuariosArr` lo que har谩 es retornar los elementos de `this.usuarios` como un arreglo _(Arreglo de objetos)_.
````
get ultimos10() {
        this.mensajes = this.mensajes.splice(0,10);
        return this.mensajes;
    }

    get usuariosArr() {
        return Object.values( this.usuarios );
    }
````
* Creamos diferentes metodos para la clase `ChatMensaje`, el primero es `enviarMensaje` que recibir谩 diferentes parametros como `uid`, `nombre` y `mensaje` que se crear谩 una nueva instancia de la clase `Mensaje` y se agregar谩 al arreglo de `this.mensajes`.
* Segundo metodo identifica cuando un usuario se conecto, recibiendo el usuario.
* El tercer metodo, es igual al segundo con la diferencia que eliminar谩 al usuario que se le pase por el parametro.
````
enviarMensaje( uid, nombre, mensaje ) {
        this.mensajes.unshift(
            new Mensaje(uid, nombre, mensaje)
        );
}

conectarUsuario( usuario ) {
        this.usuarios[usuario.id] = usuario
}

desconectarUsuario( id ) {
        delete this.usuarios[id];
}
````
En `models/index.js`
* Se agrego la importaci贸n de `ChatMensaje` y la exportacion tambien.
#
### 8.- Listado de Usuarios Conectados
Habilitaremos el socket de usuario activo, para saber cuando un usuario esta o no conectado, pero primero hay que habilitar el servidor que emita el mensaje a todos, para esto se har谩 una configuraci贸n en el servidor

En `models/server.js`
* En el metodo `Sockets()`, agregamos una funci贸n de flecha en la conexi贸n del socket y recibiremos el socket, pero llamaremos el `this.io`
````
this.io.on('connection', ( socket ) => socketController(socket, this.io));
````
En `sockets/controller.js`
* Ahora modificamos nuestro controlador del socket, recibiendo en los parametros el socket y el io, que este ultimo nos servir谩 para emitir mensajes a todos los socket que esten escuchando, sin necesidad del `broadcast`.
````
const socketController = async( socket, io ) => {...}
````
* Importamos la clase `ChatMensaje` y iniciamos una nueva instancia de este.
````
const { ChatMensaje } = require("../models");

const chatMensaje = new ChatMensaje
````
* Usamos el metodo `conectarUsuario` para registrar su conexi贸n y emitimos en el socket `usuarios-activos` los usuarios que esten conectados.
* El segundo socket es para detectar cuando un usuario se desconecta, de esta manera lo podemos registrar en el metodo `desconectarUsuario()` por el `usuario.id`, para luego emitir el cambio, que alguien se desconecto.
````
chatMensaje.conectarUsuario( usuario );
    io.emit('usuarios-activos', chatMensaje.usuariosArr)

socket.on('disconnect', () => {
        chatMensaje.desconectarUsuario( usuario.id );
        io.emit('usuarios-activos', chatMensaje.usuariosArr)
    })
````
En `public/js/chat.js`
* Para ver los cambios en el Frontend, recibiremos el payload y lo mostraremos, de esta forma vemos los usuarios conectados.
````
socket.on('usuarios-activos', (payload) => {
        console.log(payload);
    });
````
#
### 9.- Mostrar en el HTML los Usuarios Conectados
Ya que en el anterior punto podemos recibir a traves del payload los usuarios que esten conectado, ahora falta mostrarlos por pantalla con el uso del DOM, para esto es necesario lo siguiente 

En `public/js/chat.js`
* Crear una funci贸n que haga el dibujado de los usuarios conectados.
* Creamos una varibale que recibir谩 el dibujado, y utulizamos un `forEach` para hacer los cambios, desestructuramos el `nombre` y el `uid`.
* Agregamos la lista con el contenido a mostrar.
* Luego hacemos referencia al `ulUsuario` para agregar nuestro dibujado.
````
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
````
* Agregamos en el socket `usuarios-activos`, nuestra funci贸n que hara el dibujado.
````
socket.on('usuarios-activos', (payload) => {
        dibujarUsuario(payload);
    });
````
#
### 10.- Envi贸n de Mensajes a Toda la Sala de Chat
Se har谩 el evento del input, para emitir el socket del mensaje y recibirlo en el __Backend__, para luego emitirlo a todos

En `public/js/chat.js` 
* Creamos el evento `keyup` en el input.
* Almacenamos el valor del input del mensaje y del uid.
* Si el navegador detecta cualquier evento que no sea el __enter__ del teclado retornar谩 y en el caso que el largo del mensaje sea igual a 0, tambien retornar谩.
* Una vez pase las 2 condiciones, se emitira el socket con el mensaje y el uid.
* Finalmente cuando este por terminar el evento el valor del input estar谩 vac铆o.
````
txtMensaje.addEventListener('keyup', ({ keyCode }) => {

    const mensaje = txtMensaje.value;
    const uid     = txtUid.value;
    
    if( keyCode !== 13 ){ return; }
    if( mensaje.length === 0 ){ return; }

    socket.emit('enviar-mensaje', { mensaje, uid });
    txtMensaje.value = '';
});
````
En `sockets/controller.js`
* Se escuchar谩 el socket `enviar-mensaje` en el servidor, y se recibir谩 los valores que fueron enviados.
* Para luego llamar el metodo `enviarMensaje()` que le enviaremos por parametros el id, nombre y mensaje del usuario.
* Finalmente emitiremos el socket `recibir-mensajes` con el metodo get `ultimos10` que mostrar谩 los ultimos 10 mensajes.
````
socket.on('enviar-mensaje', ({ uid, mensaje }) =>{
        
        chatMensaje.enviarMensaje(usuario.id, usuario.nombre, mensaje);
        io.emit('recibir-mensajes', chatMensaje.ultimos10);
    })
````
En `public/js/chat.js`
* Finalmente recibiremos el payload del socket `recibir-mensajes` que escuchamos en el Frontend.
````
socket.on('recibir-mensajes', (payload) => {
        console.log(payload);
    });
````
#
### 11.- Hisorial de mensajes en el HTML
Ahora se har谩 otra funci贸n de dibujado, esta vez de los mensajes

En `public/js/chat.js`
* Creamos la funci贸n `dibujarMensajes()` que recibir谩 como parametro mensajes.
* Realizamos el dibujado con el `forEach` de los elementos que se mostrar谩n en la pantalla, en este caso el nombre del usuario y mensaje.
````
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
````
En `sockets/controller.js`
* En el controlador del socket `socketController` lo ponemos al inicio cuando los usuario se conecten, emitimos los mensajes desde el servidor.
````
socket.emit('recibir-mensajes', chatMensaje.ultimos10);
````
En `public/js/chat.js`
* Optimizamos el socket `recibir-mensajes` y `usuarios-activos` para que se vea mas limpio, y para que hagan los dibujados.
````
socket.on('recibir-mensajes', dibujarMensajes);
socket.on('usuarios-activos', dibujarUsuario);
````
#
### 12.- Sala en Socket, para los Mensajes Privados
Ahora es necesario habilitar los mensajes privados a traves de los socket

En `sockets/controller.js`
* Lo que hacemos es que cuando un usuario se conecta, se conecta a una sala especial.
````
socket.join( usuario.id );
````
* En caso que recibamos el `uid`, esto ser谩 un mensaje privado hacia un usuario, por esto creamos la condici贸n.
* Gracias a `socket.to()` se puede emitir a una sala asociada al `uid` recibido, en este caso se enviar谩 el mensaje y el nombre del usuario.
* En el caso que no se mande el `uid` todo seguir谩 igual, enviando el mensaje en la sala publica. 
````
socket.on('enviar-mensaje', ({ uid, mensaje }) =>{
    
        if ( uid ) {
            socket.to( uid ).emit('mensaje-privado',{ de: usuario.nombre, mensaje });
        }else{
            chatMensaje.enviarMensaje(usuario.id, usuario.nombre, mensaje);
            io.emit('recibir-mensajes', chatMensaje.ultimos10);
        }
    })
````
En `public/js/chat.js`
* Escuchamos en el socket `mensaje-privado`, y recibimos el payload, para emitirlo por consola.
````
socket.on('mensaje-privado', (payload) => {
        console.log('Privado:', payload)
    })
````
* Creamos el evento del boton, para salir de la sesi贸n.
* Lo que hace el boton es redireccionar al index y limpiar el `localStorage`.
````
btnSalir.addEventListener('click', (ev)=> {
    window.location = '/';
    localStorage.clear();
})
````
#