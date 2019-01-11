const Redis = require("ioredis");

const Database = (function() {
  const checkDbConnect = function(redisObj) {
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
      this.redis.lpush(group, stringifiedData);
      this.redis.ltrim(group, 0, process.env.REDIS_MAX_MESSAGE);
    },

    getMessages(group) {
      checkDbConnect(this.redis);
      return this.redis.lrange(group, 0, -1);
      },
    
    deleteGroup(group) {
        checkDbConnect(this.redis);
        this.redis.del(group);
    }
  };

  return db;
})();

Database.connect();
Database.clearDb();

module.exports = Database;
