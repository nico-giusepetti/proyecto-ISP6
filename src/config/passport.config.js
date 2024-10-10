import passport from "passport";

import jwt from "passport-jwt";


const JWTStrategy = jwt.Strategy;
const ExtractJwt = jwt.ExtractJwt;

const initializePassport = () => {
    passport.use("profile", new JWTStrategy({
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
        secretOrKey: "coderhouse",

    }, async (jwt_payload, done) => {
        try {
            return done(null, jwt_payload);
        } catch (error) {
            return done(error);
        }
    }))


}

const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies["coderCookieToken"];
    }
    return token;
}

export const authenticateUser = (req, res, next) => {
    passport.authenticate("profile", { session: false }, (err, user) => {
        if (err) {
            console.error("Error al autenticar:", err);
            return res.status(500).send("Error interno del servidor");
        }

        req.user = user || null; // Establece el usuario en la solicitud
        next(); // Llama al siguiente middleware o ruta
    })(req, res);
};

// export const requireAuth = (req, res, next) => {
//     if (req.isAuthenticated()) {
//         return next();
//     } else {
//         res.status(401).send("Debes estar autenticado para realizar esta acción.");
//     }
// };

export default initializePassport;