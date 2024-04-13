import { MongoClient } from "mongodb";
import { createClient } from "redis";

const filter = {};
const sort = {
  name: -1,
};

const mongo = await MongoClient.connect("mongodb://localhost:27017/");
const coll = mongo.db("ieeevisTweets").collection("tweet");
const cursor = coll.find(filter, { sort });
const tweets = await cursor.toArray();

await mongo.close();

const redis = createClient();
redis.on("error", (err) => console.log("Redis Client Error", err));
await redis.connect();

await redis.del("favoritesSum"); // remove it in case it exists

for (const tweet of tweets) {
  await redis.incrBy("favoritesSum", tweet.favorite_count || 0);
}

const totalFavorites = await redis.get("favoritesSum");
console.log("Total number of favorites:", totalFavorites);

await redis.disconnect();

// Query2: (20pts) Compute and print the total number of favorites
// in the dataset. For this apply the same process as before, query all
// the tweets, start a favoritesSum key (SET), increment it by the number
// of favorites on each tweet (INCRBY), and then get the value (GET) and
// print it on the screen.
