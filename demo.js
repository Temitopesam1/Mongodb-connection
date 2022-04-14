const { MongoClient } = require("mongodb");

async function main() {
    const uri = "mongodb+srv://temitopesam1:thankgod1.@first.jxokk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

    const client = new MongoClient(uri);

    try{
        // Connect to the Mongodb cluster
        await client.connect();

        await deleteListingsScrapedBeforeDate(client, new Date("2019-02-15"));
        
        //await deleteListingByName(client, "Cozy Cottage");


        //await updateAllListingsToHavePropertyType(client);

        // Make the appropriate DB calls
        //await client.connect();

        //await upsertListingByName(client, "Cozy Cottage", { beds: 2});

        //await updateListingByName(client, "Infinite Views", {bedrooms: 6, beds: 8 });

        //await findOneListingByName(client, "Infinite Views");
        
        // await findListingsWithMinimumbedroomsBathroomsAndMostRecentReviews(client, {
        //     minimumNumberOfBedrooms: 4,
        //     minimumNumberOfBathrooms: 2,
        //     maximumNumberOfResults: 5
        // });

        /* await createMultipleListings(client, [
    {
        name: "Infinite Views",
        summary: "Modern home with infinite views from the infinity pool",
        property_type: "House",
        bedrooms: 5,
        bathrooms: 4.5,
        beds: 5
    },
    {
        name: "Private room in London",
        property_type: "Apartment",
        bedrooms: 1,
        bathroom: 1
    },
    {
        name: "Beautiful Beach House",
        summary: "Enjoy relaxed beach living in this house with a private beach",
        bedrooms: 4,
        bathrooms: 2.5,
        beds: 7,
        last_review: new Date()
    }
]); */

    }catch(e){
        console.error(e);
    }finally{
        await client.close();
    }
}
main().catch(console.error);

//Delete multiple records
async function deleteListingsScrapedBeforeDate(client, date) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").deleteMany({ last_scraped: { $lt: date }});
    console.log(`${result.deletedCount} document(s) was/were deleted.`);
}

// Delete a record
async function deleteListingByName(client, nameOfListing) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").deleteOne({ name: nameOfListing });
    console.log(`${result.deletedCount} document(s) was/were deleted.`);
}

// Updating multiple records
async function updateAllListingsToHavePropertyType(client) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").updateMany({ property_type: { $exists: false } },
        { $set: { property_type: "unknown" } });
        console.log(`${result.matchedCount} document(s) matched the query criteria.`);
        console.log(`${result.modifiedCount} document(s) was/were updated.`);
}

// Using upsert(for updating already existing record or creating a new one)
async function upsertListingByName(client, nameOfListing, updatedListing) {
    const result = await client.db("smple_airbnb").collection("listingsAndReviews").updateOne({ name: nameOfListing },
        { $set: updatedListing },
        { upsert: true });
        console.log(`${result.matchedCount} document(s) matched the query criteria.`);
        if (result.upsertedCount > 0 ) {
            console.log(`One document was inserted with the id ${result.upsertedId._id}`);

        } else {
            console.log(`${result.modifiedCount} document(s) was/were updated.`);
        }
}

// Updating record
async function updateListingByName(client, nameOfListing, updatedListing) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").updateOne({ name: nameOfListing }, { $set: updatedListing });

    console.log(`${result.matchedCount} document(s) matched the query criteria.`);
    console.log(`${result.modifiedCount} docummet(s) was/were updated.`);
}

// Reading multiple records
async function findListingsWithMinimumbedroomsBathroomsAndMostRecentReviews(client, {
    minimumNumberOfBedrooms = 0,
    minimumNumberOfBathrooms =0,
    maximumNumberOfResults = Number.MAX_SAFE_INTEGER
} = {}) {
    const cursor = client.db("sample_airbnb").collection("listingsAndReviews").find({
        bedrooms: { $gte: minimumNumberOfBedrooms },
        bathrooms: { $gte: minimumNumberOfBathrooms}
    }).sort({ last_review: -1}).limit(maximumNumberOfResults);
   
    const results = await cursor.toArray();

    if (results.length > 0) {
        console.log(`Found listings(s) with at least ${minimumNumberOfBedrooms} bedrooms and ${minimumNumberOfBathrooms} bathrooms:`);
        results.forEach((result, i) => {
            date = new Date(result.last_review).toDateString();

            console.log();
            console.log(` ${i + 1}. name: ${result.name}`);
            console.log(` _id: ${result._id}`);
            console.log(` bedrooms: ${result.bedrooms}`);
            console.log(` bathrooms: ${result.bathrooms}`);
            console.log(` most recent review date: ${new Date(result.last_review).toDateString()}`);

        });
    } else {
        console.log(` No listings found with at least ${minimumNumberOfBedrooms} bedrooms and ${minimumNumberOfBathrooms} bathrooms`);
    }
}

// reading a single record
async function findOneListingByName(client, nameOfListing) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").findOne({ name: nameOfListing });

    if (result) {
        console.log(`Found a listing in the collection with the name '${nameOfListing}':`);
        console.log(result);
    } else{
        console.log(`No listings found with the name '${nameOfListing}'`);
    }
}

// Creating multiple records
async function createMultipleListings(client, newListings) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").insertMany(newListings);
    console.log(`${result.insertedCount} new listing(s) created with the following id(s):`);
    console.log(result.insertedIds );
}

//Creating single records
async function createListing(client, newListing) {
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").insertOne(newListing);
    console.log(`New listing created with the following id: ${result.insertedId}`);
}

// Checking out databases
async function listDatabases(client) {
    databasesList = await client.db().admin().listDatabases();
    console.log("Databases:");
    databasesList.databases.forEach(db => {console.log(` - ${db.name}`)
        
    });
}