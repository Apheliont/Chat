const Redis = require("ioredis");

const Database = (function () {
  const checkDbConnect = function (redisObj) {
    if (!redisObj) {
      throw new Error("Connect to DB first!");
    }
  };

  const db = {
    redis: null,

    connect() {
      this.redis = new Redis({
        host: process.env.REDIS_HOST,
        password: process.env.REDIS_PASSWORD
      });
    },

    clearDb() {
      checkDbConnect(this.redis);
      this.redis.flushall();
    },

    saveMessage(group, data) {
      checkDbConnect(this.redis);
      const stringifiedData = JSON.stringify(data);
      this.redis.pipeline()
      .lpush(group, stringifiedData)
      .ltrim(group, 0, process.env.REDIS_MAX_MESSAGE)
      .expire(group, process.env.REDIS_EXPIRATION_TIME)
      .exec((err, res) => {
        if (err) {
          console.log(err);
        }
      })
    },

    getMessages(group) {
      checkDbConnect(this.redis);
      return this.redis.lrange(group, 0, -1);
    },

    deleteGroup(group) {
      checkDbConnect(this.redis);
      this.redis.del(group, (err, res) => {
        console.log(res);
      });
    }
  };

  return db;
})();

Database.connect();
Database.clearDb();

module.exports = Database;
