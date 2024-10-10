import mongoose from "mongoose";

// Conectar a MongoDB
mongoose.connect("mongodb+srv://nicogiusepetti888:coderhouse@cluster0.w876crb.mongodb.net/food-house?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('No se pudo conectar a MongoDB:', err));