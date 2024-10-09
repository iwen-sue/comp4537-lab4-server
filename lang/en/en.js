exports.message = {
    // for db feature
    errorInsertData: "Error inserting data into the database",
    errorQueryDatabase: "Error querying the database",
    errorRequest: "Bad request",
    successInsertData: "Data inserted successfully",
    queryNotAllowed: "Query includes blocked methods",

    // for dict feature
    wordNotFound: (word) => `Word "${word}" not found in the dictionary`,
    wordExists: (word) => `Word "${word}" already exists in the dictionary`,
    wordAdded: (word) => `Word "${word}" added to the dictionary`,
}