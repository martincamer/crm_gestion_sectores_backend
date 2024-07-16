import jwt from "jsonwebtoken";
import { pool } from "../db.js";

export const isAuth = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      message: "No estás autorizado",
    });
  }

  try {
    const decoded = jwt.verify(token, "react2021");

    const result = await pool.query(
      "SELECT role_id,username,localidad,sucursal,provincia,sector FROM users WHERE id = $1",
      [decoded.id]
    );

    req.userId = decoded.id;
    req.userRole = result.rows[0].role_id;
    req.username = result.rows[0].username;
    req.email = result.rows[0].email;
    req.localidad = result.rows[0].localidad;
    req.provincia = result.rows[0].provincia;
    req.sucursal = result.rows[0].sucursal;
    req.sector = result.rows[0].sector;

    next();
  } catch (err) {
    return res.status(401).json({
      message: "No estás autorizado",
    });
  }
};
