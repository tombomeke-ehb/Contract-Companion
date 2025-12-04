import app from "./app.js";
import db from "./config/db.js";
const PORT = process.env.PORT || 1521;

async function start(){
  try{
    await db.verbinding();
    app.listen(PORT, () => {
      console.log(`Backend running at http://localhost:${PORT}`);
    });
  } catch(err){
    console.error("Database kan niet verbinden:",err);
    alert("Database niet verbonden");
  }
}
start();
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
