import "jsr:@std/dotenv/load";
import { Model } from '../db/orm.ts';



async function main() {

const connectionString:string =   Deno.env.get("SQLITECLOUD_URL_INCIDENT")!
  await Model.initialize(connectionString);

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
    email: 'johndoetest23@ex.com',
    description: '999-Test description',
    latitude: 333,
    longitude: 333,
    image: 'test imagxxxe'

  });


  // const johnDoe = await Customer.findBy({ username: 'johndoe' });
  // console.log('Found user:', johnDoe);

  const allCustomers = await Incident.findAll();
  console.log('All customers:', allCustomers);

  Model.database.close();
}

await main();