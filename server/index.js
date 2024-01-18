//const { Client } = require('pg');
// const client = new Client({
//     host: '127.0.0.1',
//     port: 5432,
//     user: 'postgres',
//     password: 'postgres',
//     database: 'postgres'
// })


const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const { credentials } = require('./credentials');

//const pool = require('./dbConnection');

const { Pool } = require('pg');

const pool = new Pool({
    host: credentials.pgHost,
    port: credentials.pgPort,
    user:credentials.pgUser,
    password: credentials.pgPassword,
    database: credentials.pgDatabase
    });

pool.on('error', () => console.log(`Errr connecting to the database`));
// const connect = new Client()
// user: credentials.pgUser,
//     host: credentials.pgHost,
//     database: credentials.pgDatabase,
//     password: credentials.pgPassword,
//     port: credentials.pgPort
// async function creator(){
//     try {
//         const creator = await pool.query('CREATE TABLE IF NOT EXIST values (number INT)')
//         console.log("creator");
//          if (creator) {
//             const add = await pool.query('INSERT INTO values (number) VALUES ($1)', [78]);
//             console.log(add);
//             const values = pool.query('SELECT * FROM values');
//             console.log(values)
//          }
//          console.log('get here')
//      } catch (error) {
//          console.log(error)
//      }
// }
// creator()
pool
    .query('CREATE TABLE IF NOT EXIST values (number INT)').then(()=> console.log(`Created`))
    .catch(err => {
        console.log(err);
    });

const redis = require('redis');

const redisClient = redis.createClient({
    host: credentials.redisHost,
    port: credentials.redisPort,
    retry_strategy: () => 1000
});

const redisPublisher = redisClient.duplicate();

app.get('/', (req, res) => {
    res.send('Welcome to Fibonacci');
});

app.get('/get-all-values', async(req, res) => {
    const values = pool.query('SELECT * FROM values');

    res.send(values.rows);
})

app.get('/get-current', async(req, res) => {
    redisClient.hgetall('values', (error, values) => {
        res.status(200).json({value: values});
    })
});


app.post('/post-value', async(req, res) => {
    const index = req.body.index;

    if (parseInt(index) > 40) {
        res.status(422).send(`Index too large`);
    }

    redisClient.hset('values', index, 'No value calculated yet !!!');
    redisPublisher.publish('insert', index);

    pool.query('INSERT INTO values (number) VALUES ($1)', [index]);
    

    res.send({working: true});

});

//app.use(express.json())



// app.get('/get-products', async(req, res) => {
//     try {
//         const products = await pool.query('SELECT * FROM products');

//         res.status(200).send(products.rows);
//     } catch (error) {
//         console.log(error);
//         res.status(500);
//     }
// })

// app.post('/add-product', async(req, res) => {
//     try {
//         const {body: {product_name, product_cost}} = req;

//         await client.query('INSERT INTO products (product_name, product_cost) VALUES ($1, $2)', [product_name, product_cost]);

//         res.status(200).send(`Product successfully added to the database`);


//     } catch (error) {
//         console.log(error);
//         res.status(500)
//     }


// });

// app.get('/table-creation', async(req, res) =>{
//     try {
//         console.log(client.query)
//         const test = await client.query('CREATE TABLE products (id SERIAL PRIMARY KEY, product_name VARCHAR(50), product_cost INT)');
//         console.log(test);
//         res.status(200).send(`Table successfully created ........`)
//     } catch (error) {
//         console.log(error);
//         res.status(500);
//     }
// })

const port = 8000
app.listen(port, (err) => {
    console.log(`\n Fibonacci application listening on port ${port} ...`);
})