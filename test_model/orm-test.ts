import { Database } from 'npm:@sqlitecloud/drivers'
import "jsr:@std/dotenv/load";
import { Model, Customer } from "../db/orm-buggy.ts";


export class Customer extends Model {
  static tableName = 'customers123';
}

export class Order extends Model {
  static tableName = 'orders';
}


async function main() {
  
  const connectionString = Deno.env.get("SQLITECLOUD_TEST_URL")
  console.log(connectionString);
  await Model.initialize(connectionString);

  await Customer.createTable({
    id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
    username: 'TEXT NOT NULL UNIQUE',
    email: 'TEXT NOT NULL UNIQUE'
  });

  await Order.createTable({
    id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
    username: 'TEXT NOT NULL ',
    ordernumber: 'NUM NOT NULL UNIQUE'
  });

  await Customer.insert({
    username: 'orm-test-tsjohndoe22',
    email: 'jorm-test-ts@example22.com'
  });


  await Order.insert({
    username: 'johndoe12345gg',
    ordernumber: 123
  });
  // const johnDoe = await Customer.findBy({ username: 'johndoe' });
  // console.log('Found user:', johnDoe);

  const allCustomers = await Customer.findAll();
  console.log('All customers:', allCustomers);

  Model.database.close();
}

await main();