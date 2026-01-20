if(process.env.NODE_ENV != "production"){
  require("dotenv").config({ path: "../.env" });
}
const DBurl = process.env.ATLASDB_URL;

const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

async function main() {
    await mongoose.connect(DBurl);
}

main()
  .then(() => {
    console.log("connected to DB");
  }).catch(() => {
    console.log(" error in connecting to db")
  });


let mapimplement = async (obj) => {
  let response = await geocodingClient.forwardGeocode({
    query: obj.location,
    limit: 1,
  }).send();

  if (response.body.features.length === 0) {
    console.log(`No location found for ${obj.location}`);
    return [0, 0]; // default coordinates
  }

  return response.body.features[0].geometry.coordinates; // should be [lng, lat]
};



async function initDB() {
  await Listing.deleteMany({});
  
  const newData = await Promise.all(
    initdata.data.map(async (obj) => {
      const coordinates = await mapimplement(obj);
      return {
        ...obj,
        owner: new mongoose.Types.ObjectId("696f550f36ffdb716fc2ebb8"),
        geometry: { type: "Point", coordinates }
      };
    })
  );

  await Listing.insertMany(newData);
  console.log("data added successfully");
}

initDB(); // call the async function
