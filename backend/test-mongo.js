const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://pandasoumya605_db_user:soumya@cluster0.hxsgmqc.mongodb.net/artisan_haven";
const client = new MongoClient(uri);
async function run() {
  try {
    await client.connect();
    console.log("Connected successfully to server");
    const db = client.db("artisan_haven");
    const collections = await db.collections();
    console.log("Collections:", collections.map(c => c.collectionName));
    const products = await db.collection('products').find({}).toArray();
    console.log("Products:", products.length);
  } catch (err) {
    console.log(err);
  } finally {
    await client.close();
  }
}
run();
