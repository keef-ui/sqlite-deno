import { assertEquals, assertArrayIncludes, assert } from "https://deno.land/std/testing/asserts.ts";
import { Database } from "npm:@sqlitecloud/drivers";
import "jsr:@std/dotenv/load";
import { Model, Customer } from "./test/orm-2.ts"; // Adjust the path as necessary

Deno.test("Model Initialization", async () => {
  await new Promise(resolve => setTimeout(resolve, 100));

  await Model.initialize("sqlitecloud://admin2:test1234@nstjifolsk.sqlite.cloud:8860/deno.sqlite");

  assert(Model.database instanceof Database, "Database should be initialized");
});

Deno.test("Create Customer Table", async () => {
  await Customer.createTable({
    id: "INTEGER PRIMARY KEY AUTOINCREMENT",
    username: "TEXT NOT NULL UNIQUE",
    email: "TEXT NOT NULL UNIQUE",
  });

  const tables = await Model.database.sql("SELECT name FROM sqlite_master WHERE type='table' AND name=?", Customer.tableName);
  assert(tables.length > 0, `Table '${Customer.tableName}' should be created`);
});

Deno.test("Insert Customer Record", async () => {
  await Customer.insert({
    username: "testuser",
    email: "testuser@example.com",
  });

  const result = await Customer.findBy({ username: "testuser" });
  assertEquals(result.length, 1, "One record should be found");
  assertEquals(result[0].username, "testuser");
});

Deno.test("Insert Duplicate Username", async () => {
  // Try inserting the same username again
  await Customer.insert({
    username: "testuser",
    email: "newemail@example.com",
  });

  const result = await Customer.findBy({ email: "newemail@example.com" });
  assertEquals(result.length, 0, "Duplicate username should not be inserted");
});

Deno.test("Insert Duplicate Email", async () => {
  // Try inserting the same email again
  await Customer.insert({
    username: "newuser",
    email: "testuser@example.com",
  });

  const result = await Customer.findBy({ username: "newuser" });
  assertEquals(result.length, 0, "Duplicate email should not be inserted");
});

Deno.test("Find All Customers", async () => {
  const allCustomers = await Customer.findAll();
  assert(allCustomers.length > 0, "Should find at least one customer");
  assertArrayIncludes(
    allCustomers.map((customer: any) => customer.username),
    ["testuser"],
    "Should include 'testuser'"
  );
});

Deno.test("Delete Customer Table", async () => {
  await Customer.deleteTable();
  
  const tables = await Model.database.sql("SELECT name FROM sqlite_master WHERE type='table' AND name=?", Customer.tableName);
  assertEquals(tables.length, 0, `Table '${Customer.tableName}' should be deleted`);
});

// Cleanup after tests
Deno.test("Cleanup Database", async () => {
  Model.database.close();
});
