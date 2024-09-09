import { pool } from "../db.js";

import { v4 as uuidv4 } from "uuid";

// Obtener todos los informes
export const getInformes = async (req, res, next) => {
  const { username } = req;

  // Check if username is properly passed
  if (!username) {
    return res
      .status(400)
      .json({ error: "No se proporcionó un nombre de usuario válido." });
  }

  try {
    // Log the username to verify that it is correctly extracted
    console.log("Username:", username);

    // Perform the query
    const result = await pool.query(
      "SELECT * FROM informes WHERE usuario = $1",
      [username]
    );

    // Check if no rows were found
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "No se encontraron informes" });
    }

    // Return the rows if successful
    return res.status(200).json(result.rows);
  } catch (error) {
    // Log the full error for debugging
    console.error("Error al obtener informes:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener un informe por su ID
export const getInformeById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM informes WHERE id = $1", [
      id,
    ]);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "No se encontró ningún informe con ese ID" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener informe por ID:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const crearInforme = async (req, res) => {
  const { fabrica, contratos } = req.body;

  const { username, userRole, localidad, provincia, sector } = req;

  const contratosJSON = JSON.stringify(contratos) || "[]";

  try {
    // Insert the new informe into the database
    const insertResult = await pool.query(
      "INSERT INTO informes (fabrica, contratos , localidad, usuario, role_id, sector, provincia) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [fabrica, contratosJSON, localidad, username, userRole, sector, provincia]
    );

    // Fetch all informes for the specified sector and user
    const selectResult = await pool.query(
      "SELECT * FROM informes WHERE sector = $1 AND usuario = $2",
      [sector, username]
    );

    // Respond with the newly created informe and all informes
    res.status(201).json({
      nuevoInforme: insertResult.rows[0],
      todosLosInformes: selectResult.rows,
    });
  } catch (error) {
    console.error("Error al crear informe:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const agregarDatosAContratos = async (req, res) => {
  const { id } = req.params; // ID del informe al que se va a agregar un nuevo objeto
  const { nuevoDato } = req.body; // El nuevo objeto que se desea agregar

  console.log(nuevoDato);
  try {
    // Obtener el informe existente por ID
    const selectResult = await pool.query(
      "SELECT contratos FROM informes WHERE id = $1",
      [id]
    );

    if (selectResult.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "No se encontró ningún informe con ese ID" });
    }

    // Convertir el campo contratos de texto a JSON
    let contratos = JSON.parse(selectResult.rows[0].contratos);

    // Verificar que contratos sea un arreglo; si no, inicializarlo como uno
    if (!Array.isArray(contratos)) {
      contratos = [];
    }

    // Generar un ID aleatorio y obtener la fecha actual
    const idRandom = uuidv4(); // Generar un UUID
    const fechaActual = new Date();
    const fechaCreacion = fechaActual.toISOString().split("T")[0]; // Obtener la fecha actual en formato YYYY-MM-DD

    // Agregar el ID aleatorio y la fecha de creación al nuevo dato
    const nuevoDatoConIdYFecha = {
      ...nuevoDato,
      id: idRandom,
      fechaCreacion,
    };

    // Agregar el nuevo objeto al arreglo
    contratos.push(nuevoDatoConIdYFecha);

    // Convertir el arreglo contratos nuevamente a texto JSON
    const contratosActualizados = JSON.stringify(contratos);

    // Actualizar el campo contratos en la base de datos
    const updateResult = await pool.query(
      "UPDATE informes SET contratos = $1 WHERE id = $2 RETURNING *",
      [contratosActualizados, id]
    );

    // Responder con el informe actualizado
    res.status(200).json(updateResult.rows[0]);
  } catch (error) {
    console.error("Error al agregar datos a contratos:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const eliminarContratoPorId = async (req, res) => {
  const { informeId, contratoId } = req.params;

  try {
    // Obtener el informe existente por ID
    const selectResult = await pool.query(
      "SELECT contratos FROM informes WHERE id = $1",
      [informeId]
    );

    if (selectResult.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "No se encontró ningún informe con ese ID" });
    }

    // Convertir el campo contratos de texto a JSON
    let contratos = JSON.parse(selectResult.rows[0].contratos);

    // Encontrar el índice del contrato a eliminar
    const index = contratos.findIndex((contrato) => contrato.id === contratoId);

    if (index === -1) {
      return res.status(404).json({ error: "Contrato no encontrado" });
    }

    // Eliminar el contrato del array
    contratos.splice(index, 1);

    // Convertir el arreglo contratos nuevamente a texto JSON
    const contratosActualizados = JSON.stringify(contratos);

    // Actualizar el campo contratos en la base de datos
    const updateResult = await pool.query(
      "UPDATE informes SET contratos = $1 WHERE id = $2 RETURNING *",
      [contratosActualizados, informeId]
    );

    // Responder con el informe actualizado
    res.status(200).json(updateResult.rows[0]);
  } catch (error) {
    console.error("Error al eliminar contrato:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const actualizarContratoPorId = async (req, res) => {
  const { informeId, contratoId } = req.params;
  const { datosActualizados } = req.body;

  try {
    // Obtener el informe existente por ID
    const selectResult = await pool.query(
      "SELECT contratos FROM informes WHERE id = $1",
      [informeId]
    );

    if (selectResult.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "No se encontró ningún informe con ese ID" });
    }

    // Convertir el campo contratos de texto a JSON
    let contratos;

    contratos = JSON.parse(selectResult.rows[0].contratos);

    // Encontrar el índice del contrato a actualizar
    const index = contratos.findIndex((contrato) => contrato.id === contratoId);

    console.log(contratoId);

    console.log("xd", contratos);

    // Actualizar el contrato con los nuevos datos
    contratos[index] = {
      ...contratos[index],
      ...datosActualizados,
    };

    console.log("datos", datosActualizados);

    // Convertir el arreglo contratos nuevamente a texto JSON
    const contratosActualizados = JSON.stringify(contratos);

    // Actualizar el campo contratos en la base de datos
    const updateResult = await pool.query(
      "UPDATE informes SET contratos = $1 WHERE id = $2 RETURNING *",
      [contratosActualizados, informeId]
    );

    // Responder con el informe actualizado
    res.status(200).json(updateResult.rows[0]);
  } catch (error) {
    console.error("Error al actualizar contrato:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const obtenerContratoPorId = async (req, res) => {
  const { informeId, contratoId } = req.params; // ID del informe y ID del contrato a obtener

  try {
    // Obtener el informe existente por ID
    const selectResult = await pool.query(
      "SELECT contratos FROM informes WHERE id = $1",
      [informeId]
    );

    if (selectResult.rowCount === 0) {
      return res
        .status(404)
        .json({ error: "No se encontró ningún informe con ese ID" });
    }

    // Convertir el campo contratos de texto a JSON
    const contratos = JSON.parse(selectResult.rows[0].contratos);

    // Buscar el contrato con el ID especificado
    const contrato = contratos.find((c) => c.id === contratoId);

    if (!contrato) {
      return res
        .status(404)
        .json({ error: "No se encontró ningún contrato con ese ID" });
    }

    // Responder con el contrato encontrado
    res.status(200).json(contrato);
  } catch (error) {
    console.error("Error al obtener contrato por ID:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const actualizarInforme = async (req, res) => {
  const { id } = req.params;
  const {
    autorizo,
    destino,
    numero_remito,
    vigilador,
    chofer,
    dominio_chasis,
    dominio_acoplado,
  } = req.body;
  const { username, sector } = req;

  try {
    const result = await pool.query(
      "UPDATE informes SET autorizo = $1, destino = $2, numero_remito = $3, vigilador = $4, chofer = $5, dominio_chasis = $6, dominio_acoplado = $7, updated_at = CURRENT_TIMESTAMP WHERE id = $8 AND usuario = $9 RETURNING *",
      [
        autorizo,
        destino,
        numero_remito,
        vigilador,
        chofer,
        dominio_chasis,
        dominio_acoplado,
        id,
        username,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message:
          "No se encontró ningún informe con ese ID para el usuario actual",
      });
    }

    const todosLosInformes = await pool.query(
      "SELECT * FROM informes WHERE sector = $1 AND usuario = $2",
      [sector, username]
    );

    res.status(200).json({
      informeActualizado: result.rows[0],
      todosLosInformes: todosLosInformes.rows,
    });
  } catch (error) {
    console.error("Error al actualizar informe:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Eliminar un informe
export const eliminarInforme = async (req, res) => {
  const { id } = req.params;
  const { username, sector } = req;

  try {
    const result = await pool.query("DELETE FROM informes WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "No se encontró ningún informe con ese ID" });
    }

    const todosLosInformes = await pool.query(
      "SELECT * FROM informes WHERE sector = $1 AND usuario = $2",
      [sector, username]
    );

    res.status(200).json({
      informeEliminado: result.rows[0],
      todosLosInformes: todosLosInformes.rows,
    });
  } catch (error) {
    console.error("Error al eliminar informe:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};
