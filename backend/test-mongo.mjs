import { MongoClient } from 'mongodb';
const uri = "mongodb://pandasoumya605_db_user:soumya@ac-kp7ridd-shard-00-00.hxsgmqc.mongodb.net:27017/artisan_haven?ssl=true&authSource=admin";
const client = new MongoClient(uri);
async function run() {
  try {
    await client.connect();
    console.log("Connected successfully to server");
    const db = client.db("admin");
    const isMaster = await db.command({ isMaster: 1 });
    console.log("Replica Set Name:", isMaster.setName);
  } catch (err) {
    console.log(err);
  } finally {
    await client.close();
  }
}
run();
