import { Database } from 'npm:@sqlitecloud/drivers'
import "jsr:@std/dotenv/load";

/**
 * ORM Model to use with SQLite Cloud
 * 
 * Example usage:
 * 
 * // Define a User model
 * class User extends Model {
 *   static tableName = 'users';
 * }
 * 
 * // Initialize the database
 * await Model.initialize('sqlite:///path/to/database.sqlite');
 * 
**/
export class Model {
  static database: Database;
  static tableName: string;

  // Initialize database connection
  static async initialize(connectionString: string) {
    this.database = new Database(connectionString);
  }

  // Create table with specified columns
  static async createTable(columns: { [key: string]: string }) {
    const columnDefinitions = Object.entries(columns)
      .map(([name, type]) => `${name} ${type}`)
      .join(', ');
    
    const query = `CREATE TABLE IF NOT EXISTS ${this.tableName} (${columnDefinitions})`;
    await this.database.exec(query);
    console.log(`Table '${this.tableName}' created successfully.`);
  }

  // Insert new record
  static async insert(data: { [key: string]: any }) {
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);

    const query = `INSERT INTO ${this.tableName} (${columns}) VALUES (${placeholders})`;
    await this.database.sql(query, ...values);
    console.log(`Record inserted into '${this.tableName}' successfully.`);
  }

  // Delete the table
  static async deleteTable() {
    try {
      await this.database.exec(`DROP TABLE IF EXISTS ${this.tableName}`);
      console.log(`Table '${this.tableName}' deleted successfully.`);
    } catch (error) {
      console.error(`Error deleting table '${this.tableName}':`, error);
    }
  }

  // Find records by conditions
  static async findBy(conditions: { [key: string]: any }) {
    const whereClause = Object.entries(conditions)
      .map(([key, _]) => `${key} = ?`)
      .join(' AND ');
    const values = Object.values(conditions);

    return await this.database.sql(`SELECT * FROM ${this.tableName} WHERE ${whereClause}`, ...values);
  }

  // Retrieve all records
  static async findAll() {
    return await this.database.sql(`SELECT * FROM ${this.tableName}`);
  }
}


