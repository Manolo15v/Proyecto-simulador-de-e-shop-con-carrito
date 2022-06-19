//variables globales
const obtenerProductos =  async () => {
    const res = await fetch('/productos.json');
    const data = await res.json();    
    data.forEach(producto => productos.push(producto));
}
const productos = [];
let clientes = [];
let clienteResgistrado;

//elementos html modificados
const divMostrar = document.getElementById("mostrar");
const navegacion = document.getElementById("nav");

class Cliente {
    constructor(nombre, apellido, nombreUsuario) {
        this.nombre = nombre;
        this.apellido = apellido;
        this.nombreUsuario = nombreUsuario;
        this.carrito = [];
    }

    //metodos
    agregarCarrito(nombreProducto) {
        if(!this.carrito.find(producto => producto.nombre == nombreProducto)) {
            let productoEncontrado = productos.find(producto => producto.nombre == nombreProducto);
                    productoEncontrado.cantidad = 1;
                    this.carrito.push(productoEncontrado);

                    localStorage.setItem("carrito" + this.nombreUsuario, JSON.stringify(this.carrito));
                    
                    Toastify({
                        text: "Producto agregado a carrito",
                        duration: 2500,
                        gravity: "bottom", 
                        position: "right", 
                        stopOnFocus: true, 
                        style: {
                            background: "linear-gradient(to right, #00b09b, #96c93d)", //alerta de que algo va bien
                        }
                    }).showToast();
        }else{
            Toastify({
                text: "Este producto ya fue agregado a carrito",
                duration: 2500,
                gravity: "bottom", 
                position: "right", 
                stopOnFocus: true, 
                style: {
                    background: "linear-gradient(90deg, rgba(133,4,4,1) 51%, rgba(187,196,0,1) 100%)", //alerta de que algo va mal
                }
            }).showToast();
        }
    }
    
    quitarCarrito(nombreProducto)  {
        let productoEncontrado = this.carrito.indexOf(this.carrito.find(producto => producto.nombre == nombreProducto));
        this.carrito.splice(productoEncontrado , 1);
        localStorage.setItem("carrito" + this.nombreUsuario, JSON.stringify(this.carrito));

        clienteResgistrado.verCarrito();
    }
    
    verCarrito() {
        borrarMostrado();
        let contenedor = document.createElement("div");
        if(this.carrito.length === 0) {
            let carritoCliente = JSON.parse(localStorage.getItem("carrito" + this.nombreUsuario));

            if (carritoCliente === null) {
                noCarrito();
            }else{
                if (carritoCliente.length > 0) {
                    this.carrito = carritoCliente;
                    mostrarCarrito(this.carrito);
                } else {
                    noCarrito();
                }    
            }

        }else {
            mostrarCarrito(this.carrito);
        }

        function noCarrito() {
            contenedor.innerHTML = `<p class="alert alert-danger">Tu carrito esta vacio</p>`;
            divMostrar.appendChild(contenedor);
        }

        function mostrarCarrito(productosCarrito) {
            productosCarrito.forEach(producto => { 
                contenedor.classList.add("row", "mb-2");
                let { nombre, precio, stock, cantidad } = producto;
                contenedor.innerHTML += `     
                <p>Producto: ${nombre}</p>
                <p>Precio: ${precio}$</p>                
                <div class="row mb-3">
                    <div class="col-auto">
                        <p>Cantidad deseada:</p> 
                    </div>
                    <div class="col-auto">
                    <input type="number" class="form-control" id="${nombre}" value="${cantidad}" onchange="clienteResgistrado.ajusteCantidad(document.getElementById('${nombre}').value,'${nombre}')" min='1' max='${stock}'">
                    </div>
                </div>
                <button class="btn btn-danger " onclick="clienteResgistrado.quitarCarrito('${nombre}');">Quitar producto</button>
                `;
        
                divMostrar.appendChild(contenedor);
            });            
        }
        clienteResgistrado.totalCarrito();
    }
    
    ajusteCantidad(cantidad, nombreProducto) {
       let productoEncontrado = this.carrito.find(producto => producto.nombre == nombreProducto);
       productoEncontrado.cantidad = cantidad;
       localStorage.setItem("carrito" + this.nombreUsuario, JSON.stringify(this.carrito));
       clienteResgistrado.totalCarrito();
    }

    totalCarrito()  {
        let precioMostrado = document.getElementById("precio");
        if(precioMostrado) {
            divMostrar.removeChild(precioMostrado);
        }

        let contenedor = document.createElement("div");
        contenedor.id = "precio";
        let total = this.carrito.reduce((acumulador, element) => acumulador + element.precio * element.cantidad, 0) * 1.16;

        if(total > 0) {
            contenedor.innerHTML += `<p>El total a pagar con impuestos es: ${total}$</p>`;
            divMostrar.appendChild(contenedor);
        }
    }

    salirSesion() {
        clienteResgistrado = null;
        Toastify({
            text: "Se cerró la sesion",
            duration: 2000,
            gravity: "bottom", 
            position: "right", 
            stopOnFocus: true, 
            style: {
                background: "linear-gradient(to right, #00b09b, #96c93d)", //alerta de que algo va bien
            }
        }).showToast();
        setTimeout(() => {window.location.reload()}, 5000);//espera antes de recargar la pagina y salir de sesion
    }
} 

//codigo de prueba para que haya algo en los arrays de objetos
let cliente1 = new Cliente("Manuel", "Velazco", "manolo15v");
clientes.push(cliente1);


// Inicio del programa //

let inicio = document.getElementById("inicio");
let registro = document.getElementById("registro");

inicio.onclick = () => {inicioSesion();}
registro.onclick = () => {registroCliente();}

//inicio de sesion
function inicioSesion() {
    borrarMostrado();

    //mostrando el formulario
    let formulario = document.createElement("div");
    formulario.classList.add("form")
    formulario.innerHTML = `
        <div class="mb-3">
            <label for="nombreUsuario" class="form-label">Nombre de usuario</label>
            <input type="text" class="form-control" id="nombreUsuario"  aria-describedby="emailHelp">
        </div>

        <button id="submit" type="submit" class="btn btn-primary">Iniciar sesion</button>
    `;

    divMostrar.appendChild(formulario);
 
    const enviar = document.getElementById("submit");

    //set del cliente 
    enviar.onclick = () => {
        
        clientes = JSON.parse(localStorage.getItem("clientesRegistrados"));
        
        let sesion = document.getElementById("nombreUsuario").value;
        if (clientes.find(el => el.nombreUsuario ===  sesion) != undefined) {
            let {nombre , apellido , nombreUsuario} = clientes.find(el => el.nombreUsuario ===  sesion);

            clienteResgistrado = new Cliente(nombre, apellido, nombreUsuario); //colocando al objeto existente en su clase 
            mostrarAcciones();
        }else{
            Toastify({
                text: "No se encontro usuario",
                duration: 2500,
                gravity: "top", 
                position: "center", 
                stopOnFocus: true, 
                style: {
                    background: "linear-gradient(90deg, rgba(133,4,4,1) 51%, rgba(187,196,0,1) 100%)", //alerta de que algo va mal
                }
            }).showToast();
        }
    }
}

//registro del cliente
function registroCliente() {
    borrarMostrado();

    //mostrando el formulario
    let formulario = document.createElement("div");
    formulario.classList.add("form")
    formulario.innerHTML = `
        <div class="mb-3">
            <label for="nombreCliente" class="form-label">Nombre</label>
            <input type="email" class="form-control" id="nombreCliente" aria-describedby="emailHelp">
        </div>
        <div class="mb-3">
            <label for="apellidoCliente" class="form-label">Apellido</label>
            <input type="email" class="form-control" id="apellidoCliente" aria-describedby="emailHelp">
        </div>
        <div class="mb-3">
            <label for="nombreUsuario" class="form-label">Nombre de usuario</label>
            <input type="text" class="form-control" id="nombreUsuario" aria-describedby="emailHelp">
        </div>
        
        <button id="submit" type="submit" class="btn btn-primary">Iniciar sesion</button>
    `;

    divMostrar.appendChild(formulario);

    const enviar = document.getElementById("submit");

    //set del cliente 
    enviar.onclick = () => {

        let nombreCliente = document.getElementById("nombreCliente").value;
        let apellidoCliente = document.getElementById("apellidoCliente").value;
        let nombreUsuario = document.getElementById("nombreUsuario").value;
        
        if(nombreCliente && apellidoCliente && nombreUsuario) {
            let nuevoCliente = new Cliente(nombreCliente, apellidoCliente, nombreUsuario);
            clientes.push(nuevoCliente);
            clienteResgistrado = nuevoCliente;
            localStorage.setItem("clientesRegistrados", JSON.stringify(clientes));
            
            mostrarAcciones();
        }else{
            Toastify({
                text: "Ninguno de los campos puede estar vacios",
                duration: 2500,
                gravity: "top", 
                position: "center", 
                stopOnFocus: true, 
                style: {
                    background: "linear-gradient(90deg, rgba(133,4,4,1) 51%, rgba(187,196,0,1) 100%)", //alerta de que algo va mal
                }
              }).showToast();
        }
    }    
}

function mostrarAcciones() {// todas las acciones que puede hacer el cliente
    borrarNavegacion();
    borrarMostrado();
    obtenerProductos();

    let acciones = document.createElement("ul");
    acciones.classList.add("nav", "justify-content-center");
    acciones.innerHTML = `            
        <li class="nav-item">
            <button class="border-0 nav-link">Ver productos</button>
        </li>
        <li class="nav-item">
            <button class="border-0 nav-link">Ver carrito</button>
        </li>
        <li class="nav-item">
            <button class="border-0 nav-link">Salir de sesion</button>
        </li>
    `;
    navegacion.appendChild(acciones);

    let boton = document.getElementsByTagName("button");

    //acciones para el cliente
    //mostrar productos
    boton[0].onclick = () => {mostrarProductos();}

    //ver el carrito
    boton[1].onclick = () => {clienteResgistrado.verCarrito();}

    //salir de sesion
    boton[2].onclick = () => {clienteResgistrado.salirSesion();}
}

//mostrando los productos y selecionandolos 
function mostrarProductos() {
    borrarMostrado();
    
    productos.forEach(producto => {
        let contenedor = document.createElement("div");
        contenedor.classList.add("row")
        contenedor.innerHTML = `     
        <p>Producto: ${producto.nombre}</p>
        <p>Precio: ${producto.precio}$</p>
        <p>Disponibles: ${producto.stock}</p>
        `;

        //muestra si se puede agregar el producto o no
        producto.disponible === true ? contenedor.innerHTML += `<button class="btn btn-success" onclick="clienteResgistrado.agregarCarrito('${producto.nombre}');">Agregar producto</button>` : contenedor.innerHTML += `<p class="btn btn-danger">Producto no disponible</p>`;
        
        divMostrar.appendChild(contenedor);
    });
}
 
//funciones de borrado
function borrarMostrado() {
    divMostrar.innerHTML = "";
}
function borrarNavegacion() {
    navegacion.innerHTML = "";
}