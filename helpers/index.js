import Models from "../models/index.js"



import axios from "axios";


const find = async (modelDb, queryObj) =>
  await Models[modelDb].find(queryObj).exec();

const findOne = async (modelDb, queryObj) =>
  await Models[modelDb].findOne(queryObj).exec();
const findOneAndSelect = async (modelDb, queryObj, selectQuery) =>
  await Models[modelDb].findOne(queryObj).select(selectQuery).exec();

const insertNewDocument = async (modelDb, storeObj) => {
  let data = new Models[modelDb](storeObj);
  return await data.save();
};

const insertManyDocuments = async (modelDb, storeObj) => {
  
    // Insert multiple documents into the specified model
    const result = await Models[modelDb].insertMany([storeObj]);
    return result; // Return the result of the insert operation
 
};



// const updateDocument = async (modelDb, updateQuery, setQuery) =>
//   await Models[modelDb]
//     .findOneAndUpdate(updateQuery, { $set: setQuery }, { new: true })
//     .lean();

const updateDocument = async (modelDb, updateQuery, setQuery) => {
  // If `setQuery` contains `$inc`, don't wrap it inside `$set`
  let updateOperation = {};

  if (setQuery.$inc) {
    updateOperation = setQuery;
  } else {
    updateOperation = { $set: setQuery };
  }

  return await Models[modelDb]
    .findOneAndUpdate(updateQuery, updateOperation, { new: true })
    .lean();
};

const updateDocuments = async (modelDb, updateQuery, setQuery) =>
  await Models[modelDb]
    .updateMany(updateQuery, { $set: setQuery }, { multi: true })
    .lean();

const customUpdate = async (modelDb, updateQuery, setQuery) =>
  await Models[modelDb].updateOne(updateQuery, setQuery);

const findAndSort = async (modelDb, queryObj, querytime) =>
  await Models[modelDb].find(queryObj).sort(querytime).exec();

const pushIntoArray = async (modelDb, updateQuery, setQuery) =>
  await Models[modelDb].findOneAndUpdate(
    updateQuery,
    { $addToSet: setQuery },
    { new: true }
  );

const deleteDocument = async (modelDb, deleteQuery) =>
  await Models[modelDb].deleteOne(deleteQuery);

const deleteManyDocument = async (modelDb, deleteQuery) =>
  await Models[modelDb].deleteMany(deleteQuery);

const findOneAndPopulate = async (
  modelDb,
  searchQuery,
  populateQuery,
  selectQuery
) =>
  await Models[modelDb]
    .findOne(searchQuery)
    .populate({ path: populateQuery, select: selectQuery })
    .lean();

const findAndPopulate = async (
  modelDb,
  searchQuery,
  populateQuery,
  selectQuery
) =>
  await Models[modelDb]
    .find(searchQuery)
    .populate({ path: populateQuery, select: selectQuery })
    .lean();

const findPopulateSortAndLimit = async (
  modelDb,
  searchQuery,
  populateQuery,
  selectQuery,
  sortedBy,
  skip,
  limit
) =>
  await Models[modelDb]
    .find(searchQuery)
    .populate({ path: populateQuery, select: selectQuery })
    .sort(sortedBy)
    .skip(skip)
    .limit(limit)
    .lean();

const findSliceAndPopulate = async (
  modelDb,
  searchQuery,
  sliceQuery,
  populateQuery,
  selectQuery
) =>
  await Models[modelDb]
    .find(searchQuery, sliceQuery)
    .populate({ path: populateQuery, select: selectQuery })
    .lean();

const findAndPopulateNested = async (modelDb, searchQuery, populate) =>
  await Models[modelDb].find(searchQuery).populate(populate).lean();

const findSliceAndPopulateNested = async (
  modelDb,
  searchQuery,
  sliceQuery,
  populate
) =>
  await Models[modelDb].find(searchQuery, sliceQuery).populate(populate).lean();

// Firebase file upload function
// const firebaseFileUpload = (dbFilePath, fileName, filePath) => {
//   return new Promise((resolve) => {
//     const storageRef = ref(storage, dbFilePath + fileName);
//     const theFile = fs.readFileSync(filePath);
//     const uploadTask = uploadBytesResumable(storageRef, theFile);
//     uploadTask.on(
//       "state_changed",
//       (snapshot) => {
//         const progress =
//           (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
//         console.log("Upload is " + progress + "% done");
//         switch (snapshot.state) {
//           case "paused":
//             console.log("Upload is paused");
//             break;
//           case "running":
//             console.log("Upload is running");
//             break;
//         }
//       },
//       (error) => {
//         switch (error.code) {
//           case "storage/unauthorized":
//             console.log(error.code);
//             break;
//           case "storage/canceled":
//             console.log(error.code);
//             break;
//           case "storage/unknown":
//             console.log(error.code);
//             break;
//         }
//       },
//       () => {
//         getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
//           console.log("File available at", downloadURL);
//           fs.unlinkSync(filePath);
//           resolve(downloadURL);
//         });
//       }
//     );
//   });
// };

const getAggregate = async (modelDb, aggregateQuery) =>
  await Models[modelDb].aggregate(aggregateQuery);

const findOneSliceAndPopulate = async (
  modelDb,
  searchQuery,
  sliceQuery,
  populateQuery,
  selectQuery
) =>
  await Models[modelDb]
    .findOne(searchQuery, sliceQuery)
    .populate({ path: populateQuery, select: selectQuery })
    .lean();

const findOneSliceAndCustomPopulate = async (
  modelDb,
  searchQuery,
  sliceQuery,
  customQuery
) =>
  await Models[modelDb]
    .findOne(searchQuery, sliceQuery)
    .populate(customQuery)
    .lean();

const getDataWithLimit = async (modelDb, searchQuery,sortedBy, skip, limit) =>
  await Models[modelDb]
    .find(searchQuery)
     .sort(sortedBy)
    .skip(skip)
    .limit(limit)
    .exec();

    // REQ and RES logs Get
const getDataWithLimitLogs = async (modelDb, searchQuery, sortedBy, skip, limit) => {
  return await Models[modelDb].aggregate([
    { $match: searchQuery },
    { $sort: sortedBy },
    { $skip: skip },
    { $limit: limit }
  ],{ allowDiskUse: true }); // ✅ this is the correct syntax
};

// Sort data with limit--------------------------------------------
const getDataWithSort = async (modelDb, searchQuery,skip, limit) =>
  await Models[modelDb]
    .find(searchQuery)
    //.sort(sortedBy)
    .skip(skip)
    .limit(limit)
    .exec();




const getDataSelectWithLimit = async (
  modelDb,
  searchQuery,
  selectQuery,
  sortedBy,
  skip,
  limit
) =>
  await Models[modelDb]
    .find(searchQuery)
    .select(selectQuery)
    .sort(sortedBy)
    .skip(skip)
    .limit(limit)
    .exec();

const isValidURL = (string) => {
  var res = string?.match(
    /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
  );
  // console.log(res);
  return res !== null;
};

const axiosGetCall = async (url) => {
  try {
    const response = await axios.get(url);
    // console.log("response", response);
    // console.log(await axios.get(url));
    return response.data;
  } catch (error) {
    // return { tokenUriError: "some error occured " };

  }
};

export {
  find,
  findOne,
  insertNewDocument,
  insertManyDocuments,
  updateDocument,
  deleteDocument,
  findOneAndPopulate,
  // firebaseFileUpload,
  findAndPopulate,
  pushIntoArray,
  findAndPopulateNested,
  customUpdate,
  getAggregate,
  findOneSliceAndPopulate,
  findOneSliceAndCustomPopulate,
  getDataWithLimit,
  getDataSelectWithLimit,
  findSliceAndPopulateNested,
  findSliceAndPopulate,
  findOneAndSelect,
  findPopulateSortAndLimit,
  deleteManyDocument,
  isValidURL,
  axiosGetCall,
  findAndSort,
  updateDocuments,
  getDataWithSort,
  getDataWithLimitLogs
};
