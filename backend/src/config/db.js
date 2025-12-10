// Database configuration and connection setup

import oracledb from "oracledb";

// Create Oracle connection pool using environment variables
async function verbinding() {
  await oracledb.createPool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT_STRING, // e.g. host:1521/orclpdb.ehb.local
  });

  console.log("DB connected");
}

// Gracefully close the connection pool
async function close() {
  const pool = oracledb.getPool();
  if (pool) {
    await pool.close(0); // 0 means close immediately
  }
}

// Simple query helper
async function query(sql, bindParams = [], options = {}) {
  let conn;
  const execOptions = {
    outFormat: oracledb.OUT_FORMAT_OBJECT,
    autoCommit: false,
    ...options,
  };

  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(sql, bindParams, execOptions);
    return result;
  } finally {
    if (conn) {
      await conn.close();
    }
  }
}

export { verbinding, close, query };
