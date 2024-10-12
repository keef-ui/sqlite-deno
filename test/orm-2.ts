import { Database } from 'npm:@sqlitecloud/drivers'
import "jsr:@std/dotenv/load";



export class Model {
  static database: Database;
  static tableName: string;

  static async initialize(connectionString: string) {
    // this.database = new Database(connectionString);
    this.database = new Database({connectionstring: connectionString,
      usewebsocket: true,
      verbose: true});
  }

  static async createTable(columns: { [key: string]: string }) {
    const columnDefinitions = Object.entries(columns)
      .map(([name, type]) => `${name} ${type}`)
      .join(', ');
    
    const query = `CREATE TABLE IF NOT EXISTS ${this.tableName} (${columnDefinitions})`;
    await this.database.exec(query);
    console.log(`Table '${this.tableName}' created successfully.`);
  }

  static async insert(data: { [key: string]: any }) {
    // Check if the username already exists
    if (data.username) {
      const existingUser = await this.findBy({ username: data.username });

      if (existingUser.length > 0) {
        console.log(`Username '${data.username}' already exists. Record not inserted.`);
        return;
      }
    }
      // Check if the email already exists
      if (data.email) {
        const existingEmail = await this.findBy({ email: data.email });
  
        if (existingEmail.length > 0) {
          console.log(`Email '${data.email}' already exists. Record not inserted.`);
          return;
        }
      }

    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);

    const query = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders})`;
    await this.database.sql(query, ...values);
    console.log(`Record inserted into '${this.tableName}' successfully.`);
  }
  static async deleteTable() {
    try {
      const query = `DROP TABLE IF EXISTS ${this.tableName}`;
      await this.database.exec(query);
      console.log(`Table '${this.tableName}' deleted successfully.`);
    } catch (error) {
      console.error(`Error deleting table '${this.tableName}':`, error);
    }
  }
  static async findBy(conditions: { [key: string]: any }) {
    const whereClause = Object.entries(conditions)
      .map(([key, _]) => `${key} = ?`)
      .join(' AND ');
    const values = Object.values(conditions);

    const query = `SELECT * FROM ${this.tableName} WHERE ${whereClause}`;
    return await this.database.sql(query, ...values);
  }

  static async findAll() {
    const query = `SELECT * FROM ${this.tableName}`;
    return await this.database.sql(query);
  }
}

export class Customer extends Model {
  static tableName = 'customerstest';
}

// async function main() {
//   const connectionString = Deno.env.get("SQLITECLOUD_URL")
//   await Model.initialize(connectionString);

//   await Customer.createTable({
//     id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
//     username: 'TEXT NOT NULL UNIQUE',
//     email: 'TEXT NOT NULL UNIQUE'
//   });

//   await Customer.insert({
//     username: 'johndoe99',
//     email: 'johndoe@example99.com'
//   });

//   const johnDoe = await Customer.findBy({ username: 'johndoe' });
//   console.log('Found user:', johnDoe);

//   const allCustomers = await Customer.findAll();
//   console.log('All customers:', allCustomers);

//   Model.database.close();
// }

// await main();