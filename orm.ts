import { Database } from 'npm:@sqlitecloud/drivers'

class Model {
  static database: Database;
  static tableName: string;

  static async initialize(connectionString: string) {
    this.database = new Database(connectionString);
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
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);

    const query = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders})`;
    await this.database.sql(query, ...values);
    console.log(`Record inserted into '${this.tableName}' successfully.`);
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

class Customer extends Model {
  static tableName = 'customers';
}

async function main() {
  await Model.initialize('sqlitecloud://admin2:test1234@nstjifolsk.sqlite.cloud:8860/deno.sqlite');

  await Customer.createTable({
    id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
    username: 'TEXT NOT NULL UNIQUE',
    email: 'TEXT NOT NULL UNIQUE'
  });

  await Customer.insert({
    username: 'johndoe2',
    email: 'johndoe@example2.com'
  });

  const johnDoe = await Customer.findBy({ username: 'johndoe' });
  console.log('Found user:', johnDoe);

  const allCustomers = await Customer.findAll();
  console.log('All customers:', allCustomers);

  Model.database.close();
}

await main();