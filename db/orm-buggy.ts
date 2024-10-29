import { Database } from 'npm:@sqlitecloud/drivers'
import "jsr:@std/dotenv/load";

//******************************************** */
// DENO-only:Temp fix for connction bug in Model.initialize
// this.database = new Database({connectionstring: connectionString,
//   usewebsocket: true,
//   verbose: true});
// }
//******************************************** */

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

export class Customer extends Model {
  static tableName = 'customerstest';
}
