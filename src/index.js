// Importa el servidor de Express desde tu archivo app.js
import app from "./app.js";
import { ORIGIN, PORT } from "./config.js";

// Importa createServer y Server de http y socket.io respectivamente
import { createServer } from "http";
import { Server } from "socket.io";

// Crea el servidor HTTP utilizando Express
const httpServer = createServer(app);

// Crea el servidor de Socket.io y adjúntalo al servidor HTTP
const io = new Server(httpServer, {
  cors: {
    origin: ORIGIN,
    credentials: true,
  },
});

// Maneja eventos de Socket.io
io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("crear-contrato", (guardarContrato) => {
    io.emit("crear-contrato", guardarContrato);
  });

  socket.on("guardar-contrato-garantias", (guardarContrato) => {
    io.emit("guardar-contrato-garantias", guardarContrato);
  });

  socket.on("guardar-contrato-garantias-con-platea", (guardarContrato) => {
    io.emit("guardar-contrato-garantias-con-platea", guardarContrato);
  });
  socket.on("guardar-contrato-garantias-sin-platea", (guardarContrato) => {
    io.emit("guardar-contrato-garantias-sin-platea", guardarContrato);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
