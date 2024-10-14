import { pool } from "../db.js";

// Obtener todas las cargas
export const getCargas = async (req, res, next) => {
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
    const result = await pool.query("SELECT * FROM cargas WHERE usuario = $1", [
      username,
    ]);

    // Check if no rows were found
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "No se encontraron cargas" });
    }

    // Return the rows if successful
    return res.status(200).json(result.rows);
  } catch (error) {
    // Log the full error for debugging
    console.error("Error al obtener cargas:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};
// Obtener una carga por su ID
export const getCargaById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM cargas WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "No se encontró ninguna carga con ese ID" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener carga por ID:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const crearCarga = async (req, res) => {
  const { nombre_apellido, numero_remito, datos, destino } = req.body;

  const { username, userRole, localidad, provincia, sector } = req;

  try {
    // Convert datos to JSON string if it's an object, else use default empty JSON array string
    const datosString = datos ? JSON.stringify(datos) : "[]";

    // Insert the new carga into the database
    const insertResult = await pool.query(
      "INSERT INTO cargas (nombre_apellido, numero_remito, datos, destino, localidad, usuario, role_id, sector, provincia) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
      [
        nombre_apellido,
        numero_remito,
        datosString,
        destino,
        localidad,
        username,
        userRole,
        sector,
        provincia,
      ]
    );

    // Fetch all cargas for the specified sector and user
    const selectResult = await pool.query(
      "SELECT * FROM cargas WHERE sector = $1 AND usuario = $2",
      [sector, username]
    );

    // Respond with the newly created carga and all cargas
    res.status(201).json({
      nuevaCarga: insertResult.rows[0],
      todasLasCargas: selectResult.rows,
    });
  } catch (error) {
    console.error("Error al crear carga:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const actualizarCarga = async (req, res) => {
  const { id } = req.params;
  const { nombre_apellido, numero_remito, datos, destino, localidad } =
    req.body;
  const { username, sector } = req;

  // Solo actualizar 'datos' si ha sido proporcionado, sino mantener el valor actual
  let datosString = null;
  if (datos) {
    datosString = JSON.stringify(datos);
  }

  try {
    // Construimos dinámicamente la consulta de actualización para que solo incluya campos que realmente han cambiado
    let updateQuery = `
      UPDATE cargas
      SET nombre_apellido = $1,
          numero_remito = $2,
          destino = $3,
          localidad = $4,
          updated_at = CURRENT_TIMESTAMP
    `;
    const queryParams = [
      nombre_apellido,
      numero_remito,
      destino,
      localidad,
      id,
      username,
    ];

    if (datosString) {
      updateQuery += `, datos = $5`;
      queryParams.splice(4, 0, datosString); // Insertar datosString en la posición correcta
    }

    updateQuery += ` WHERE id = $6 AND usuario = $7 RETURNING *`;

    // Ejecutamos la consulta de actualización
    const result = await pool.query(updateQuery, queryParams);

    if (result.rowCount === 0) {
      return res.status(404).json({
        message:
          "No se encontró ninguna carga con ese ID para el usuario actual",
      });
    }

    // Recuperamos todas las cargas del sector para el usuario
    const todasLasCargas = await pool.query(
      "SELECT * FROM cargas WHERE sector = $1 AND usuario = $2",
      [sector, username]
    );

    // Respondemos con la carga actualizada y todas las cargas del usuario
    res.status(200).json({
      cargaActualizada: result.rows[0],
      todasLasCargas: todasLasCargas.rows,
    });
  } catch (error) {
    console.error("Error al actualizar carga:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Eliminar una carga
export const eliminarCarga = async (req, res) => {
  const { id } = req.params;
  const { username, sector } = req;

  try {
    const result = await pool.query("DELETE FROM cargas WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "No se encontró ninguna carga con ese ID" });
    }

    const todasLasCargas = await pool.query(
      "SELECT * FROM cargas WHERE sector = $1 AND usuario = $2",
      [sector, username]
    );

    res.status(200).json({
      cargaEliminada: result.rows[0],
      todasLasCargas: todasLasCargas.rows,
    });
  } catch (error) {
    console.error("Error al eliminar carga:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};
