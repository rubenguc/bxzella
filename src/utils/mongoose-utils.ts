/**
 * Transform Mongoose document to plain JSON with stringified ObjectIds
 *
 * This utility converts Mongoose documents to plain JSON objects,
 * ensuring all ObjectId fields are converted to strings for safe
 * serialization to Client Components.
 *
 * @param doc - Mongoose document or any object with potential ObjectIds
 * @returns Plain JSON object with all ObjectIds converted to strings
 */
export function transformDocument<T = any>(doc: any): T | null {
  if (!doc) return null;

  const plain = doc.toObject ? doc.toObject() : doc;

  // Use a replacer function to convert ObjectIds to strings
  return JSON.parse(
    JSON.stringify(plain, (key, value) => {
      // Check if value is a Mongoose ObjectId or BSON ObjectId
      if (
        value &&
        typeof value === "object" &&
        value.constructor &&
        (value.constructor.name === "ObjectId" ||
          value.constructor.name === "ObjectID")
      ) {
        return value.toString();
      }
      // Handle BSON ObjectId with toHexString method
      if (
        value &&
        typeof value.toHexString === "function" &&
        value._bsontype === "ObjectID"
      ) {
        return value.toHexString();
      }
      return value;
    }),
  );
}
