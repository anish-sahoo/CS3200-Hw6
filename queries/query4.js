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

await redis.del("leaderboard");

for (let i = 0; i < tweets.length; ++i) {
  await redis.zIncrBy("leaderboard", 1, tweets[i].user.screen_name);
}
const userLeaderboard = await redis.zRange("leaderboard", 0, -1, { REV: true });

for (let i = 0; i < 10; i++) {
  const screenName = userLeaderboard[i];
  const numTweets = await redis.zScore("leaderboard", screenName);
  console.log(`${i + 1}. ${screenName}: ${numTweets}`);
}

await redis.disconnect();

// Query4: (20pts) Create a leaderboard with the top 10 users 
// with more tweets. Use a sorted set called leaderboard