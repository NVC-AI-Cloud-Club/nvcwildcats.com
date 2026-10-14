// =============================================
// Lambda 3: getMembers
// Triggered by: API Gateway GET /members
// What it does:
//   Fetches all "approved" members from DynamoDB
//   and returns them as JSON for the HTML page to render
// =============================================

import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";

// ---- FILL THIS IN ----
const REGION = "YOUR_REGION"; // e.g. us-east-2
// ----------------------

const dynamo = new DynamoDBClient({ region: REGION });
const TABLE_NAME = "featured-members";

export const handler = async () => {
    try {
        const result = await dynamo.send(new ScanCommand({
            TableName: TABLE_NAME,
            FilterExpression: "#s = :approved",
            ExpressionAttributeNames: { "#s": "status" },
            ExpressionAttributeValues: { ":approved": { S: "approved" } }
        }));

        const members = result.Items.map(item => ({
            memberId:                     item.memberId?.S                      || "",
            name:                         item.name?.S                          || "",
            role:                         item.role?.S                          || "",
            contributions:                item.contributions?.S                 || "",
            "contribution 2":             item["contribution 2"]?.S             || "",
            "contribution 3":             item["contribution 3"]?.S             || "",
            "additional contributions":   item["additional contributions"]?.S   || "",
            linkedin:                     item.linkedin?.S                      || "",
            github:                       item.github?.S                        || "",
            website:                      item.website?.S                       || "",
            "any additional information": item["any additional information"]?.S || "",
            submittedAt:                  item.submittedAt?.S                   || ""
        }));

        // Sort by submission date, newest first
        members.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(members)
        };

    } catch (err) {
        console.error("getMembers error:", err);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: "Failed to fetch members." })
        };
    }
};
