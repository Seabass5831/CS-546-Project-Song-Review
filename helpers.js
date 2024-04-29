import { ObjectId } from "mongodb";

const exportedMethods = {
  checkString(strVal, varName) {
    if (!strVal) throw `Error: You must supply a ${varName}!`;
    if (typeof strVal !== "string") throw `Error: ${varName} must be a string!`;
    strVal = strVal.trim();
    if (strVal.length === 0)
      throw `Error: ${varName} cannot be an empty string or string with just spaces`;

    return strVal;
  },
  requiredParams(args) {
    for (let i = 0; i < args.length; i++) {
      if (args[i] === undefined) {
        throw new Error("Missing parameters ");
      }
    }
  },

  isValidDateFormat(dateString) {
    // Regular expression to match the format YYYY-MM-DD
    const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;

    // Test if the date string matches the format
    return dateFormatRegex.test(dateString);
  },
  checkId(id, varName) {
    if (!id)
      throw new Error(`${varName} cannot be an empty string or just spaces`);
    if (typeof id !== "string") throw new Error(`${varName} is not a string`);
    id = id.trim();
    if (id.length === 0)
      throw new Error(`${varName} cannot be an empty string or just spaces`);
    if (!ObjectId.isValid(id))
      throw new Error(`${varName} is not a valid ObjectID`);
    return id;
  },
  checkNumber(num, varName) {
    if (!num)
      throw new Error(`${varName} cannot be an empty string or just spaces`);
    if (typeof num !== "number") throw new Error(`${varName} is not a number`);
    return num;
  },
  isValidEmail(email) {
    // Regular expression pattern for validating email addresses
    var pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Check if the email matches the pattern
    return pattern.test(email);
  },
  convertDate(currentDate) {
    //takes in a new Date() object and converts it to YYYY-MM-DD
    const year = currentDate.getFullYear();
    // Months are zero-based (0 for January, 1 for February, etc.)
    // So we add 1 to get the correct month number
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Ensure 2 digits with leading zero
    const day = currentDate.getDate().toString().padStart(2, "0"); // Ensure 2 digits with leading zero

    // Format the date as "yyyy-mm-dd"
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  },
  checkStringArray(arr, varName) {
    if (!arr || !Array.isArray(arr))
      throw new Error(`${varName} is not an array`);
    if (arr.length == 0) {
      throw new Error(`${varName} must be of length at least 1`);
    }
    for (let i in arr) {
      if (typeof arr[i] !== "string" || arr[i].trim().length === 0) {
        throw new Error(`${varName} is not an array of strings`);
      }
      arr[i] = arr[i].trim();
    }
    return arr;
  },

};
export default exportedMethods;
