const {credentials} = require("./credentials");
const redis = require('redis');


const redisClient = redis.createClient({
    host: credentials.redisHost,
    port: credentials.redisPort,
    retry_strategy: ()=> 1000
});

const sub = redisClient.duplicate();
const fibonacci = (index) => {
    if (index < 2) {
        return 1
    }
    return fibonacci(index -1) + fibonacci(index - 2);
}

sub.on('message', (channel, message) => {
    redisClient.hset('value', message, fibonacci(parseInt(message)));
})

sub.subscribe('insert');