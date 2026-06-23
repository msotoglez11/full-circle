const {MongoClient}= require('mongodb');
require('dotenv').config();

const dbURL=process.env.ATLAS_URI;

let db;

async function connectToDB(){
    try{
        console.log(dbURL);
        const client=new MongoClient(dbURL);
        await client.connect();
        console.log('Connected to MongoDB');
        db=client.db("Full_Circle");

    } catch(error){
        console.error('Error connecting to MongoDB', error);
        throw error;

    }

}

function getCollection(collectionName){
    if (!db){
        throw new Error('Database not connected. Call connectionToDB first');
    }
    return db.collection(collectionName);
}
module.exports={
    connectToDB, getCollection
};