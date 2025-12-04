// Database configuration and connection setup


//onderste lijn zorgt ervoor dat we de oracle commandos kunnen gebruiken
const oracledb= require('oracledb');

//database verbinding maken
async function verbinding(){
  //zorgt dat de db verbinding kan maken adhv naam, wachtwoord, service...
  //await om te wachten om daarna bevestigen
  await oracledb.createPool({
    user: 'CC',
    password: 'x8JR4g2wEVy6',
    connectString: 'host:1521/orclpdb.ehb.local'
  });
  //bevestiging verbinding
  console.log('DB verbonden');
};

//nu async functie wnr de db deftig gaat sluiten
async function close(){
  await oracledb.getPool().close(0); //0 betekent sluit meteen
};


//queries uitvoeren
async function query(sql){
  let conn;
  options.outFormat = oracledb.OUT_FORMAT_OBJECT;
  try { conn = await oracledb.getConnection(); const result = await conn.execute(sql);
     return result;
    }finally{
       if (conn) { 
        await conn.close(); 
        } 
      }
};

//zorgt dat andere bestanden deze functies kunnen gebruiken
module.exports = {
  init,
  close,
  query,
};