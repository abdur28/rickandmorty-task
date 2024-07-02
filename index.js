const fs = require("fs");
const pg = require("pg");
const axios = require("axios");

const config = {
    connectionString: "postgres://candidate:62I8anq3cFq5GYh2u4Lh@rc1b-r21uoagjy1t7k77h.mdb.yandexcloud.net:6432/db1",
    ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync("/home/abdurrahman/postgresql/root.crt").toString(),
    },
};

const conn = new pg.Client(config);

conn.connect((err) => {
    if (err) {
        console.error("Connection error", err.stack);
    } else {
        console.log("Connected to the database");
        createTableAndFetchCharacters();
    }
});

const createTableAndFetchCharacters = async () => {
    try {
        // Create table if it doesn't exist
        await conn.query(`
            CREATE TABLE IF NOT EXISTS abdur28 (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                data JSONB NOT NULL
            );
        `);

        console.log("Table 'abdur28' created or already exists");

        let page = 1;
        let allCharacters = [];
        let morePages = true;

        // Fetch characters from Rick and Morty API
        while (morePages) {
            const response = await axios.get(`https://rickandmortyapi.com/api/character?page=${page}`);
            const characters = response.data.results;
            allCharacters = allCharacters.concat(characters);
            morePages = response.data.info.next !== null;
            page++;
        }

        // Insert characters into the table
        for (const character of allCharacters) {
            await conn.query(
                `INSERT INTO abdur28 (name, data) VALUES ($1, $2)`,
                [character.name, character]
            );
        }

        console.log("All characters have been inserted into the database");

        
        // // Delete the whole table
        // await conn.query(`DROP TABLE IF EXISTS abdur28`);
        // console.log("Table 'abdur28' deleted successfully");


        
        // // Log the result
        // const queryResult = await conn.query(`SELECT * FROM abdur28`);

        // console.log("Rows in abdur28 table:");
        // console.log(queryResult.rows);


        conn.end();
    } catch (error) {
        console.error("Error fetching or inserting characters:", error);
        conn.end();
    }
};
