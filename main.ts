import { Database } from 'npm:@sqlitecloud/drivers'


//let database = new Database(`sqlitecloud://admin2:test1234@nspcsdqyiz.sqlite.cloud:8860/chinook.sqlite`);
let database = new Database(`sqlitecloud://admin2:test1234@nstjifolsk.sqlite.cloud:8860/chinook.sqlite`);

let name = 'Breaking The Rules'

let results = await database.sql`SELECT * FROM tracks WHERE name = ${name}`
// => returns [{ AlbumId: 1, Name: 'Breaking The Rules', Composer: 'Angus Young... }]
console.log(results)



