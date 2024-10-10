import { Router } from "express"
import { ProductManager } from "../dao/db/product-manager-db.js"
import { CartManager } from "../dao/db/cart-manager-db.js"
import passport from "passport"
import {authenticateUser} from "../config/passport.config.js";

const router = Router()
const productManager = new ProductManager()
const cartManager = new CartManager();

// Aplica el middleware en las rutas que necesiten autenticación
router.use(authenticateUser); // Esto se aplicará a todas las rutas de este router

// Ruta de inicio de la app (home)
// router.get("/", async (req, res) => {
//     const user = req.usuario || null; // Obtenemos el usuario si está autenticado
//     console.log(user);
    
//     res.render("home", {user, showNavbar: true})
// })
router.get("/", async (req, res) => {
    passport.authenticate("profile", { session: false }, (err, user) => {
        if (err) {
            console.error("Error al autenticar:", err);
            return res.status(500).send("Error interno del servidor");
        }

        req.user = user || null; // Establece el usuario en la solicitud

        res.render("home", {
            user: req.user, // Pasa el usuario al contexto de la vista
            showNavbar: true
        });
    })(req, res);
});

// Ruta para mostarar el listado actual de productos
router.get("/products", async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const productos = await productManager.getProducts({
            page: parseInt(page),
            limit: parseInt(limit)
        });

        const nuevoArray = productos.docs.map(producto => {
            const { _id, ...rest } = producto.toObject();
            // return rest;
            return { _id, ...rest }; // Incluir el _id en el objeto retornado
        });

        res.render("products", {
            productos: nuevoArray,
            hasPrevPage: productos.hasPrevPage,
            hasNextPage: productos.hasNextPage,
            prevPage: productos.prevPage,
            nextPage: productos.nextPage,
            currentPage: productos.page,
            totalPages: productos.totalPages,
            showNavbar: true,
            user: req.user, // Pasa el usuario al contexto de la vista
        });

    } catch (error) {
        console.error("Ocurrió un error al obtener productos", error);
        res.status(500).json({
            status: 'error',
            error: "Ocurrió un error en el servidor"
        });
    }
})

// Ruta que muestra los productos en tiempo real
router.get("/realTimeProducts",passport.authenticate("profile", {session:false}), (req, res) => {
    if(req.user.rol == "admin"){
        res.render("realTimeProducts", {showNavbar: false, user: req.user})
        return
    }
    // res.render("realTimeProducts", {showNavbar: false});
    res.status(500).json({ error: "Error interno del servidor. no autorizado" });
})


//Ruta para los carritos de compra segun su ID
router.get("/carts/:cid", async (req, res) => {
    const carritoId = req.params.cid;
    
    try {
        const carrito = await cartManager.getCarritoById(carritoId);

        if (!carrito) {
            console.log("No existe ese carrito con el id");
            return res.status(404).json({ error: "Carrito no encontrado" });
        }
        console.log(carrito.products);

        const productosEnCarrito = carrito.products.map(item => ({
            product: item.product.toObject(),
            //Lo convertimos a objeto para pasar las restricciones de Exp Handlebars. 
            quantity: item.quantity
        }));


        res.render("carts", { productos: productosEnCarrito, showNavbar: true, user: req.user });
    } catch (error) {
        console.error("Error al obtener el carrito", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});


//ruta de inicio de sesion
router.get("/login", (req, res) => {
    res.render("login",{showNavbar: false, user: req.user})
})

//ruta del registro
router.get("/register", (req, res) => {
    res.render("register",{showNavbar: false, user: req.user})
})




export default router; 