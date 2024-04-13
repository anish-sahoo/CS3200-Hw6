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

const distinctUsers = new Set();
tweets.forEach((tweet) => {
  distinctUsers.add(tweet.user.screen_name);
});

console.log(`Number of distinct users: ${distinctUsers.size}`);

await redis.disconnect();

// Query3: (20pts) Compute how many distinct users are there in the
// dataset. For this use a set by the screen_name, e.g. screen_names
