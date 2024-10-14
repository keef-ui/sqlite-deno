import { assertEquals, assertExists } from "https://deno.land/std@0.202.0/testing/asserts.ts";
import { Database } from 'npm:@sqlitecloud/drivers';
import "jsr:@std/dotenv/load";

/************************************************ NOT WORKING***************** */

// Import your Model and Customer classes here
// For this example, I'll assume they're in a file called orm.ts
import { Model, Customer } from "../test/orm-2.ts";

// Mock database for testing
class MockDatabase {
  async exec(query: string) {
    // Mock implementation
  }
  async sql(query: string, ...params: any[]) {
    // Mock implementation
    return [];
  }
  close() {
    // Mock implementation
  }
}

Deno.test("Model initialization", async () => {
  const connectionString = Deno.env.get("SQLITECLOUD_URL")!;
  await Model.initialize(connectionString);
  assertExists(Model.database);
});

Deno.test("Create table", async () => {
  // Mock the database
  Model.database = new MockDatabase() as unknown as Database;

  await Customer.createTable({
    id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
    username: 'TEXT NOT NULL UNIQUE',
    email: 'TEXT NOT NULL UNIQUE'
  });
  
  // If no error is thrown, we assume the table was created successfully
});

Deno.test("Insert customer", async () => {
  // Mock the database
  Model.database = new MockDatabase() as unknown as Database;

  await Customer.insert({
    username: 'testuser',
    email: 'testuser@example.com'
  });

  // If no error is thrown, we assume the insert was successful
});

Deno.test("Find customer", async () => {
  // Mock the database
  Model.database = new MockDatabase() as unknown as Database;

  const mockCustomer = { id: 1, username: 'testuser', email: 'testuser@example.com' };

  // Override the sql method to return our mock customer
  Model.database.sql = async () => [mockCustomer];

  const foundCustomer = await Customer.findBy({ username: 'testuser' });
  assertEquals(foundCustomer, [mockCustomer]);
});

Deno.test("Find all customers", async () => {
  // Mock the database
  Model.database = new MockDatabase() as unknown as Database;

  const mockCustomers = [
    { id: 1, username: 'user1', email: 'user1@example.com' },
    { id: 2, username: 'user2', email: 'user2@example.com' }
  ];

  // Override the sql method to return our mock customers
  Model.database.sql = async () => mockCustomers;

  const allCustomers = await Customer.findAll();
  assertEquals(allCustomers, mockCustomers);
});

Deno.test("Delete table", async () => {
  // Mock the database
  Model.database = new MockDatabase() as unknown as Database;

  await Customer.deleteTable();
  
  // If no error is thrown, we assume the table was deleted successfully
});