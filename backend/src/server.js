// backend/src/server.js

import app from "./app.js";
//import connectDB from "./config/db.js";

const PORT = process.env.PORT || 3000;

// connect database
//connectDB();

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
