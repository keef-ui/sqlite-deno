import { Database } from 'npm:@sqlitecloud/drivers'
import "jsr:@std/dotenv/load";



export class Model {
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

