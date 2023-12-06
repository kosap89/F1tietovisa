const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();

//käytetään bodyParseria JSON pyyntöjen käsittelyyn
app.use(bodyParser.json());

require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

//yhdistetään tietokantaan ja tarkistetaan että yhteys onnistuu
connection.connect(error => {
  if (error) {
    console.error('Virhe yhdistettäessä tietokantaan: ' + error.message);
    return;
  }
  console.log('Tietokantayhteys onnistunut!');
});

//määritellään palvelimen portti
const port = 3000;
app.listen(port, () => {
  console.log(`Palvelin käynnissä portissa ${port}`);
});

//hakkee kaikki kysymykset tietokannasta
app.get('/questions', (req, res) => {
    connection.query('SELECT * FROM questions', (error, results) => {
      if (error) {
        console.error('Virhe hakiessa kysymyksiä: ' + error.message);
        res.status(500).send('Virhe tietokantahaussa');
        return;
      }
      res.json(results);
    });
  });

  //tallentaa käyttäjän vastauksen
app.post('/answer', (req, res) => {
    const { question_id, user_answer } = req.body;
    connection.query('INSERT INTO answers (question_id, user_answer) VALUES (?, ?)', [question_id, user_answer], (error) => {
      if (error) {
        console.error('Virhe tallennettaessa vastausta: ' + error.message);
        res.status(500).send('Virhe tietokantaan tallennettaessa');
        return;
      }
      res.json({ success: true, message: 'Vastaus tallennettu.' });
    });
  });
  
  //mahdollistaa uusien kysymysten lisäämisen
  app.post('/questions', (req, res) => {
    const { question, correct_answer } = req.body;
    connection.query('INSERT INTO questions (question, correct_answer) VALUES (?, ?)', [question, correct_answer], (error) => {
      if (error) {
        console.error('Virhe lisättäessä kysymystä: ' + error.message);
        res.status(500).send('Virhe tietokantaan lisättäessä');
        return;
      }
      res.json({ success: true, message: 'Kysymys lisätty.' });
    });
  });

  /* Tietokannan luonti lauseet  
  CREATE DATABASE f1_trivia;

  USE f1_trivia;

  CREATE TABLE questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question TEXT,
    correct_answer TEXT
  );

  CREATE TABLE answers (
    question_id INT,
    user_answer TEXT,
    FOREIGN KEY (question_id) REFERENCES questions(id)
  );
  */