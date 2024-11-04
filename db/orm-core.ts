import { Database } from 'npm:@sqlitecloud/drivers'
import "jsr:@std/dotenv/load";

/**
 * ORM Model to use with SQLite Cloud
 * // This model is to be used for sqlite_Cloud: Import like:
 * import { Model} from './path/to/your/orm-core.ts';
 *          OR if using sqlite Cloud withh Deno use:
 * import { Model_sqlite_cloud as Model} from './path/to/your/orm-core.ts';
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
  static async update(data: { [key: string]: any }) {
    if (!data.id) {
      console.log("No ID provided. Record not updated.");
      return;
    }
  
    const existingRecord = await this.findBy({ id: data.id });
    if (existingRecord.length === 0) {
      console.log(`Record with ID '${data.id}' does not exist. Update not performed.`);
      return;
    }
  
    const columns = Object.keys(data)
      .filter(key => key !== 'id')
      .map(key => `${key} = ?`)
      .join(', ');
    const values = Object.values(data).filter(value => value !== data.id);
    const query = `UPDATE ${this.tableName} SET ${columns} WHERE id = ?`;
    
    const result =await this.database.sql(query, ...values, data.id);
    console.log(`Record with ID '${data.id}' updated successfully.`);
    return result
  }
  //Delete record
  static async delete(id: string | number) {
    if (!id) {
      console.log("No ID provided. Record not deleted.");
      return;
    }
  
    const existingRecord = await this.findBy({ id });
    if (existingRecord.length === 0) {
      console.log(`Record with ID '${id}' does not exist. Deletion not performed.`);
      return;
    }
  
    const query = `DELETE FROM ${this.tableName} WHERE id = ?`;
    const result = await this.database.sql(query, id);
  
    console.log(`Record with ID '${id}' deleted successfully.`);
    return result;
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

  // Describe the table
  static async describeTable() {
    try {
      const tableInfo = await this.database.sql`PRAGMA table_info(${this.tableName})`;
      if (tableInfo.length === 0) {
        console.log(`Table '${this.tableName}' does not exist.`);
        return;
      }
      
      console.log(`\nDescription of table '${this.tableName}':`);
      console.log('Column Name | Data Type | Not Null | Default Value | Primary Key');
      console.log('------------|-----------|----------|----------------|-------------');
      
      for (const column of tableInfo) {
        console.log(`${column.name.padEnd(12)}| ${column.type.padEnd(10)}| ${column.notnull ? 'Yes'.padEnd(9) : 'No'.padEnd(9)}| ${(column.dflt_value || '').padEnd(15)}| ${column.pk ? 'Yes' : 'No'}`);
      }
      return tableInfo;
    } catch (error) {
      console.error(`Error describing table '${this.tableName}':`, error);
    }
  }
}

export class Model_sqlite_cloud extends Model {
// This model is to be used for sqlite_Cloud: Import like:
// import { Model_sqlite_cloud as Model} from './path/to/your/orm-core.ts';
  static async initialize(connectionString: string) {
    this.database = new Database({connectionstring: connectionString,
      usewebsocket: true,
      verbose: true});
  }


  // Find incidents this week
  static async findThisWeek() {
    const { startOfWeek, endOfWeek } = this.getWeekRange();
    return await this.database.sql(`SELECT * FROM ${this.tableName} WHERE timestamp BETWEEN ? AND ?`, startOfWeek.toISOString(), endOfWeek.toISOString());
  }

  // Find incidents this month
  static async findThisMonth() {
    const { startOfMonth, endOfMonth } = this.getMonthRange();
    return await this.database.sql(`SELECT * FROM ${this.tableName} WHERE timestamp BETWEEN ? AND ?`, startOfMonth.toISOString(), endOfMonth.toISOString());
  }

  // Helper function to get the start and end of the current week
  static getWeekRange() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now.setDate(now.getDate() - dayOfWeek));
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    endOfWeek.setHours(23, 59, 59, 999);
    return { startOfWeek, endOfWeek };
  }

  // Helper function to get the start and end of the current month
  static getMonthRange() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);
    return { startOfMonth, endOfMonth };
  }

}


