// =============================================
// Lambda 2: approveMember
// Triggered by: API Gateway GET /approve
// What it does:
//   Updates member status to "approved" or "denied"
//   in DynamoDB when president clicks the email link
// =============================================

import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

// ---- FILL THIS IN ----
const REGION = "YOUR_REGION"; // e.g. us-east-2
// ----------------------

const dynamo = new DynamoDBClient({ region: REGION });
const TABLE_NAME = "featured-members";

export const handler = async (event) => {
    try {
        const { memberId, action } = event.queryStringParameters || {};

        if (!memberId || !action) {
            return {
                statusCode: 400,
                headers: { "Content-Type": "text/html" },
                body: "<h2>Invalid request — missing memberId or action.</h2>"
            };
        }

        const status = action === "approve" ? "approved" : "denied";

        await dynamo.send(new UpdateItemCommand({
            TableName: TABLE_NAME,
            Key: { memberId: { S: memberId } },
            UpdateExpression: "SET #s = :status",
            ExpressionAttributeNames: { "#s": "status" },
            ExpressionAttributeValues: { ":status": { S: status } }
        }));

        const emoji = status === "approved" ? "✅" : "❌";
        const color = status === "approved" ? "#00f0ff" : "#ff4444";

        return {
            statusCode: 200,
            headers: { "Content-Type": "text/html" },
            body: `
                <html>
                <body style="font-family:sans-serif;text-align:center;padding:60px;background:#0b0f1a;color:#f0f9ff;">
                    <h1 style="color:${color};">${emoji} Member ${status}!</h1>
                    <p style="font-size:1.2rem;color:#94f0ff;">
                        The featured members page will update automatically.
                    </p>
                    <p style="margin-top:20px;">
                        <a href="https://www.nvcwildcats.com/membersinfo.html"
                           style="color:#00f0ff;">View the featured members page</a>
                    </p>
                </body>
                </html>
            `
        };

    } catch (err) {
        console.error("approveMember error:", err);
        return {
            statusCode: 500,
            headers: { "Content-Type": "text/html" },
            body: "<h2>Something went wrong. Please try again.</h2>"
        };
    }
};
