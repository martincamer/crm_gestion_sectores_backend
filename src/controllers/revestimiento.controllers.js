import { pool } from "../db.js";

// Obtener todos los revestimientos.
export const getRevestimientos = async (req, res, next) => {
  const { username } = req;

  // Verificar si el nombre de usuario se pasó correctamente
  if (!username) {
    return res
      .status(400)
      .json({ error: "No se proporcionó un nombre de usuario válido." });
  }

  try {
    // Loguear el nombre de usuario para verificar que se extrae correctamente
    console.log("Username:", username);

    // Ejecutar la consulta
    const result = await pool.query(
      "SELECT * FROM revestimiento WHERE usuario = $1",
      [username]
    );

    // Devolver las filas si se encontró algo
    return res.status(200).json(result.rows);
  } catch (error) {
    // Loguear el error completo para depuración
    console.error("Error al obtener revestimientos:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Obtener un revestimiento por su ID.
export const getRevestimientoById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM revestimiento WHERE id = $1",
      [id]
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "No se encontró ningún revestimiento con ese ID" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener revestimiento por ID:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Crear un nuevo revestimiento.
export const crearRevestimiento = async (req, res) => {
  const {
    nombre_apellido_contrato,
    numero_contrato,
    localidad_contrato,
    provincia_contrato,
    datos,
    datosCanje,
    revestida,
    canje,
  } = req.body;

  const { username, userRole, localidad, provincia, sector } = req;

  try {
    // Convertir datos a cadena JSON si es un objeto, de lo contrario usar cadena vacía por defecto
    const datosString = datos ? JSON.stringify(datos) : "[]";
    const datosCanjeString = datosCanje ? JSON.stringify(datosCanje) : "[]";

    // Insertar el nuevo revestimiento en la base de datos
    const insertResult = await pool.query(
      "INSERT INTO revestimiento (nombre_apellido_contrato, numero_contrato,localidad_contrato,provincia_contrato, datos, datosCanje, revestida, canje, localidad, usuario, role_id, sector, provincia) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *",
      [
        nombre_apellido_contrato,
        numero_contrato,
        localidad_contrato,
        provincia_contrato,
        datosString,
        datosCanjeString,
        revestida,
        canje,
        localidad,
        username,
        userRole,
        sector,
        provincia,
      ]
    );

    // Obtener todos los revestimientos para el sector y usuario especificados
    const selectResult = await pool.query(
      "SELECT * FROM revestimiento WHERE sector = $1 AND usuario = $2",
      [sector, username]
    );

    // Responder con el revestimiento recién creado y todos los revestimientos
    res.status(201).json({
      nuevoRevestimiento: insertResult.rows[0],
      todosLosRevestimientos: selectResult.rows,
    });
  } catch (error) {
    console.error("Error al crear revestimiento:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Actualizar un revestimiento existente
export const actualizarRevestimiento = async (req, res) => {
  const { id } = req.params;
  const {
    nombre_apellido_contrato,
    localidad_contrato,
    provincia_contrato,
    numero_contrato,
    datos,
    datosCanje,
    revestida,
    canje,
  } = req.body;
  const { username, userRole, sector } = req;

  try {
    // Convertir datos y datosCanje a cadenas JSON si es un objeto, de lo contrario usar cadena vacía por defecto
    const datosString = datos ? JSON.stringify(datos) : "[]";
    const datosCanjeString = datosCanje ? JSON.stringify(datosCanje) : "[]";

    // Actualizar revestimiento en la base de datos
    const result = await pool.query(
      `UPDATE revestimiento 
       SET nombre_apellido_contrato = $1, 
           localidad_contrato = $2, 
           provincia_contrato = $3, 
           numero_contrato = $4, 
           datos = $5, 
           datosCanje = $6, 
           revestida = $7, 
           canje = $8, 
           updated_at = CURRENT_TIMESTAMP 
       WHERE id = $9 AND usuario = $10 
       RETURNING *`,
      [
        nombre_apellido_contrato,
        localidad_contrato,
        provincia_contrato,
        numero_contrato,
        datosString,
        datosCanjeString,
        revestida,
        canje,
        id,
        username,
      ]
    );

    // Verificar si se actualizó el revestimiento
    if (result.rowCount === 0) {
      return res.status(404).json({
        message:
          "No se encontró ningún revestimiento con ese ID para el usuario actual",
      });
    }

    // Obtener todos los revestimientos para el sector y usuario especificados
    const todosLosRevestimientos = await pool.query(
      "SELECT * FROM revestimiento WHERE sector = $1 AND usuario = $2",
      [sector, username]
    );

    // Responder con el revestimiento actualizado y todos los revestimientos
    res.status(200).json({
      revestimientoActualizado: result.rows[0],
      todosLosRevestimientos: todosLosRevestimientos.rows,
    });
  } catch (error) {
    console.error("Error al actualizar revestimiento:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};

// Eliminar un revestimiento
export const eliminarRevestimiento = async (req, res) => {
  const { id } = req.params;
  const { username, sector } = req;

  try {
    const result = await pool.query("DELETE FROM revestimiento WHERE id = $1", [
      id,
    ]);

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ message: "No se encontró ningún revestimiento con ese ID" });
    }

    const todosLosRevestimientos = await pool.query(
      "SELECT * FROM revestimiento WHERE sector = $1 AND usuario = $2",
      [sector, username]
    );

    res.status(200).json({
      revestimientoEliminado: result.rows[0],
      todosLosRevestimientos: todosLosRevestimientos.rows,
    });
  } catch (error) {
    console.error("Error al eliminar revestimiento:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
};
