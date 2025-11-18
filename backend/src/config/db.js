// src/config/db.js
// Database configuration and connection setup

// import {database} from "{database_library}";

export default async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connected");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
