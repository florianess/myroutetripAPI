const app = require('express')();
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');
const cors = require('cors');
const AWS = require('aws-sdk');

const graphqlSchema = require('./graphql/schema')
const graphqlResolvers = require('./graphql/resolvers')
const { isAuth } = require('./middleware');

AWS.config.loadFromPath('./credentials.json');
const s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    params: {Bucket: 'myroutetrip'}
})

app.use(bodyParser.json());
app.use(cors());
app.use(isAuth)

app.use('/graphql', graphqlHttp({
    schema: graphqlSchema,
    rootValue: graphqlResolvers,
    graphiql: true,
}))

mongoose.connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-leuuc.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`,
    { useNewUrlParser: true })
    .then(() => {
        console.log('App listen at port 3000');
        app.listen(3001);
    })
    .catch(err => {
        console.log(err);
    })

