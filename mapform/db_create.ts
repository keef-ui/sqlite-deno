import { Database } from 'npm:@sqlitecloud/drivers'
import "jsr:@std/dotenv/load";
import { Model } from '../db/orm-2.ts';

async function main() {
  const connectionString = Deno.env.get("SQLITECLOUD_URL_INCIDENT")
  await Model.initialize("sqlitecloud://admin2:test1234@nstjifolsk.sqlite.cloud:8860/incident-reporting.sqlite");

 class Incident extends Model {
    static tableName = 'incident';
  }
  

  await Incident.createTable({
    id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
    email: 'TEXT NOT NULL',
    description: 'TEXT NOT NULL ',
    latitude: 'NUM NOT NULL ',
    longitude: 'NUM NOT NULL ',
    timestamp: 'DATETIME DEFAULT CURRENT_TIMESTAMP',
    image: 'text'

  });



  await Incident.insert({
    email: 'johndoe12345gg',
    description: 'Test description',
    latitude: 123,
    longitude: 123,
    image: 'test image'

  });


  // const johnDoe = await Customer.findBy({ username: 'johndoe' });
  // console.log('Found user:', johnDoe);

  const allCustomers = await Incident.findAll();
  console.log('All customers:', allCustomers);

  Model.database.close();
}

await main();