import { assertEquals, assertArrayIncludes, assert } from "https://deno.land/std/testing/asserts.ts";
import { Database } from "npm:@sqlitecloud/drivers";
import "jsr:@std/dotenv/load";
import { Model } from "../db/orm-buggy.ts"; // Adjust the path as necessary


//Test setup
const connectionString:string =   Deno.env.get("SQLITECLOUD_TEST_URL")!
const incident_connectionString:string =   Deno.env.get("SQLITECLOUD_URL_INCIDENT")!

class Customer extends Model{
  static tableName = 'customerstest';
}

                                   //Table name
const testOptions = { sanitizeOps: false, sanitizeResources: false };   //Test options, this is a hack, maybe bug in deno


Deno.test("Model Initialization",testOptions, async () => {
  await new Promise(resolve => setTimeout(resolve, 100));


  await Model.initialize(connectionString);

 
  assert(Model.database instanceof Database, "Database should be initialized");
});

Deno.test("Create Customer Table", testOptions,async () => {
 
  await Customer.createTable({
    id: "INTEGER PRIMARY KEY AUTOINCREMENT",
    username: "TEXT NOT NULL UNIQUE",
    email: "TEXT NOT NULL UNIQUE",
  });
  
  await Customer.describeTable();

  const tables = await Model.database.sql("SELECT name FROM sqlite_master WHERE type='table' AND name=?", Customer.tableName);
  assert(tables.length > 0, `Table '${Customer.tableName}' should be created`);
});

Deno.test("Insert Customer Record", testOptions,async () => {
  await Customer.insert({
    username: "orm_test_buggy",
    email: "testuser@example.com",
  });

  const result = await Customer.findBy({ username: "orm_test_buggy" });
  assertEquals(result.length, 1, "One record should be found");
  assertEquals(result[0].username, "orm_test_buggy");
});

Deno.test("Insert Duplicate Email", testOptions,async () => {
  // Try inserting the same username again
  await Customer.insert({
    username: "neworm_test_buggy",
    email: "testuser@example.com",
  });

  const result = await Customer.findBy({ email: "testuser@example.com" });
  assertEquals(result.length, 1
    , "Duplicate username should not be inserted");
});

Deno.test("Insert Duplicate Username", testOptions, async () => {
  // Try inserting the same email again
  await Customer.insert({
    username: "orm_test_buggy",
    email: "newtestuser@example.com",
  });

  const result = await Customer.findBy({ username: "orm_test_buggy" });
  assertEquals(result.length, 1, "Duplicate email should not be inserted");
});

Deno.test("Find All Customers", testOptions, async () => {
  const allCustomers = await Customer.findAll();
  assert(allCustomers.length > 0, "Should find at least one customer");
  assertArrayIncludes(
    allCustomers.map((customer: any) => customer.username),
    ["orm_test_buggy"],
    "Should include 'orm_test_buggy'"
  );
});

Deno.test("Delete Customer Table", testOptions,async () => {
  // Customer.tableName='xxx'
  await Customer.deleteTable();
  
  const tables = await Model.database.sql("SELECT name FROM sqlite_master WHERE type='table' AND name=?", Customer.tableName);
  assertEquals(tables.length, 0, `Table '${Customer.tableName}' should be deleted`);
});

// Cleanup after tests
Deno.test("Cleanup Database", testOptions ,async () => {
  Model.database.close();
});

Deno.test("incident-describe", testOptions,async () => {

  class Incident extends Model{
    static tableName = 'incident';
  }
  await Model.initialize(incident_connectionString);
  await Incident.describeTable();

  
 
  assertEquals(1, 1, `Table '${Customer.tableName}' should be deleted`);
});