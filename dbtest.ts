import { Database } from 'npm:@sqlitecloud/drivers'
import { Input } from "https://deno.land/x/cliffy@v1.0.0-rc.4/prompt/mod.ts";
import "jsr:@std/dotenv/load";



const connectionString = Deno.env.get("SQLITECLOUD_DENO")


//to run on deno type  > deno run -A dbtest.ts

let database = new Database(connectionString);

// Function to list all tables in the database
async function listAllTables() {
  try {
    const tables = await database.sql`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'`;
    console.log("\nList of tables in the database:");
    tables.forEach((table, index) => {
      console.log(`${index + 1}. ${table.name}`);
    });
  } catch (error) {
    console.error("Error listing tables:", error);
  }
}


// Function to create a table
async function createTable(tableName, columns) {
  try {
    const columnDefinitions = columns.map(col => {
      let def = `${col.name} ${col.type}`;
      if (col.primaryKey) def += ' PRIMARY KEY';
      if (col.autoIncrement) def += ' AUTOINCREMENT';
      if (col.notNull) def += ' NOT NULL';
      if (col.unique) def += ' UNIQUE';
      if (col.default !== undefined) def += ` DEFAULT ${col.default}`;
      return def;
    }).join(', ');

    const query = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefinitions})`;
    await database.exec(query);
    console.log(`Table '${tableName}' created successfully.`);
  } catch (error) {
    console.error(`Error creating table '${tableName}':`, error);
  }
}

// Function to describe a given table
async function describeTable(tableName) {
  try {
    const tableInfo = await database.sql`PRAGMA table_info(${tableName})`;
    if (tableInfo.length === 0) {
      console.log(`Table '${tableName}' does not exist.`);
      return;
    }
    
    console.log(`\nDescription of table '${tableName}':`);
    console.log('Column Name | Data Type | Not Null | Default Value | Primary Key');
    console.log('------------|-----------|----------|----------------|-------------');
    
    for (const column of tableInfo) {
      console.log(`${column.name.padEnd(12)}| ${column.type.padEnd(10)}| ${column.notnull ? 'Yes'.padEnd(9) : 'No'.padEnd(9)}| ${(column.dflt_value || '').padEnd(15)}| ${column.pk ? 'Yes' : 'No'}`);
    }
  } catch (error) {
    console.error(`Error describing table '${tableName}':`, error);
  }
}

// List all tables before creating new one
await listAllTables();


//promt for table. Keyboard input
const tableSearch: string = await Input.prompt(`What table do you want to describe (Type in the name)?`);

describeTable(tableSearch);

let table="users";

let table2="sessions";
// Create customers table using the new function
await createTable(table, [
  { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
  { name: 'name', type: 'TEXT', notNull: true, unique: true },
  { name: 'email', type: 'TEXT', notNull: true, unique: true }
  { name: 'password', type: 'TEXT', notNull: true }
]);

// Create customers table using the new function
await createTable(table, [
  { name: 'id', type: 'INTEGER', primaryKey: true, autoIncrement: true },
  { name: 'name', type: 'TEXT', notNull: true, unique: true },
  { name: 'email', type: 'TEXT', notNull: true, unique: true },
  { name: 'password', type: 'TEXT', notNull: true }
]);

export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  userId: integer('userId')
    .references(() => users.id)
    .notNull(),
  expiresAt: timestamp('expires_at').notNull(),
});

// Check if user 'johndoe' exists, if not create it
let username = '22johndoeee';
let email = 'zzz22johndoe@example.com';

let existingUser = await database.sql`SELECT * FROM ${table} WHERE username = ${username}`;

if (existingUser.length === 0) {
  // User doesn't exist, so insert it
  let test=await database.sql`INSERT INTO  ${table} (username, email) VALUES (${username}, ${email})`;
  console.log(`User '${username}' created successfully.----> ${test}`);
  console.log(test)
} else {
  console.log(`User '${username}' already exists.`);
}



// Close the database connection
database.close();




// Describe the tracks table (assuming it exists in the database)
//await describeTable('tracks');

// Original query
//let name = 'Breaking The Rules';
//let results = await database.sql`SELECT * FROM tracks WHERE name = ${name}`;
//console.log("\nTrack results:", results);