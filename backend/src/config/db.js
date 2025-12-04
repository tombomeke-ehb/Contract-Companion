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
