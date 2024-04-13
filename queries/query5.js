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

for (const tweet of tweets) {
  await redis.lPush(`tweets:${tweet.user.screen_name}`, tweet.id_str);
  await redis.hSet(`tweet:${tweet.id_str}`, {
    tweet: JSON.stringify(tweet),
  });
}

// getting from example user duto_guerra
const user = 'duto_guerra';
const tweetIds = await redis.lRange(`tweets:${user}`, 0, -1);
for (const id of tweetIds) {
  const tweetInfo = await redis.hGetAll(`tweet:${id}`);
  console.log(JSON.parse(tweetInfo.tweet));
}

await redis.disconnect();

// Query5: (30pts) Create a structure that lets you get all the 
// tweets for an specific user. Use lists for each screen_name 
// e.g. a list with key tweets:duto_guerra that points to a list 
// of all the tweet ids for duto_guerra, e.g. [123, 143, 173, 213]. 
// and then a hash that links from tweetid to the tweet information 
// e.g. tweet:123 which points to all the tweet attributes (i.e. 
//   user_name, text, created_at, etc)