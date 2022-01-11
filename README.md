
# RestServer + WebSocket
Reutilización del RestServer y agregar contenido de Socket.io, validando los socket con JWT, ademas de envio de mensajes con Socket. Utilizamos los siguientes elementos: 

* __[REST Server con Node.js y Express](https://github.com/Paserno/node-express-restserver-fst)__
* __[Socket.io](https://www.npmjs.com/package/socket.io)__ - [Pagina Oficial](https://socket.io/docs/v4/)

#
Para reconstruir los modulos de node ejecute el siguiente comando.

````
npm install
````

# 
### 1.- Primeros pasos - Configuración
Reutilizamos el RestServer, instalamos las dependencias y buscamos las variables de entorno, luego realizamos la instalación de __Socket.io__

En `models/server.js`
* Configuramos el servidor en base a la documentación de __Socket.io__, agregamos esos elementos en el constructor de la clase `Server`.
````
this.server = require('http').createServer(this.app);
this.io = require('socket.io')(this.server);
````
* En el metodo `listen()` cambiamos `this.app` por `this.server` para que soporte __socket.io__ nuestra aplicación.
````
listen() {
        this.server.listen(this.port, () => {
            console.log('Servidor corriendo en el puerto', this.port);
        });
    }
````
* Creamos un nuevo metodo llamado `sockets()` y lo ponemos en el constructor, esto nos servirá para conectar a los diferentes clientes.
* Importamos la función `socketController()` que crearemos a continuación.
````
sockets(){
        this.io.on('connection', socketController);
    }
````
En `sockets/controller.js`
* Creamos el controlador de socket que es utilizado en la clase `Server`.
* Mandamos un `console.log` que un nuevo cliente se conecto, para comprobar la conexión que se hará en el __Frontend__.
````
const socketController = ( socket ) => {

    console.log('cliente conectado', socket.id );
}
````
* Exportamos la función.
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
* Agregamos esto propio de Socket.io para el cliente, esto hará que se conecte al servidor de socket y de esta manera la consola detectará un nuevo cliente en el __Backend__.
````
const socket = io();
````
#