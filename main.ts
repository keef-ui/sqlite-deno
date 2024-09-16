import { Database } from 'npm:@sqlitecloud/drivers'
import "jsr:@std/dotenv/load";

const connectionString = Deno.env.get("SQLITECLOUD_URL")!;

let database = new Database(connectionString);

let name = 'Breaking The Rules'

let results = await database.sql`SELECT * FROM tracks WHERE name = ${name}`
// => returns [{ AlbumId: 1, Name: 'Breaking The Rules', Composer: 'Angus Young... }]
console.log(results)



