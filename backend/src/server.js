import app from "./app.js";
import db from "./config/db.js";// zorgt dat we alle functies van db.js kunnen gebruiken 
const PORT = process.env.PORT || 1521; //zegt welke poort moet gebruiken voor db

async function start(){
  try{
    await db.verbinding(); //start db verbinding
    app.listen(PORT, () => {
      console.log(`Backend running at http://localhost:${PORT}`);
    });
  } catch(err){ 
    console.error("Database kan niet verbinden:",err);
    alert("Database niet verbonden");
  }
}
start();
