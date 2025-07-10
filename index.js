import { GetItemCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { ddbClient } from "./ddbClient.js";

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME;

export const handler = async (event) => {
    const respond = (statusCode, message) => ({
        statusCode,
        headers: {
            "Access-Control-Allow-Origin": "*"
        },
        body: typeof message === "string" ? message : JSON.stringify(message)
    });

    try {

        let customerId = event.queryStringParameters?.customerId;

        if (!customerId) {
            return respond(400, { message: "customerId is required" });
        }

        const command = new GetItemCommand({
            TableName: TABLE_NAME,
            Key: {
                PK: { S: "CUSTOMER" },
                SK: { S: customerId }
            }
        });

        const result = await ddbClient.send(command);
        if (!result.Item) {
            return respond(404, { message: "Customer not found" });
        }

        const item = unmarshall(result.Item);

        const customer = {
            customerId: item.customerId,
            name: item.name,
            address: item.address,
            email: item.email,
            phone: item.phone
        };

        return respond(200, customer);
    } catch (error) {
        console.error("GetItem Error:", error);
        return respond(500, { message: "Failed to retrieve customer" });
    }
};
