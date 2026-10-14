// =============================================
// Lambda 1: submitMember
// Triggered by: API Gateway POST /submit
// What it does:
//   1. Saves submission to DynamoDB as "pending"
//   2. Emails president with Approve / Deny links
// =============================================

import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { randomUUID } from "crypto";

// ---- FILL THESE IN ----
const REGION = "YOUR_REGION";                          // e.g. us-east-2
const PRESIDENT_EMAIL = "YOUR_EMAIL@student.alamo.edu";
const APPROVE_BASE_URL = "YOUR_API_GATEWAY_URL/approve"; // fill after API Gateway is created
// -----------------------

const dynamo = new DynamoDBClient({ region: REGION });
const ses = new SESClient({ region: REGION });
const TABLE_NAME = "featured-members";

export const handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const memberId = randomUUID();

        // Save all form fields to DynamoDB
        await dynamo.send(new PutItemCommand({
            TableName: TABLE_NAME,
            Item: {
                memberId:                  { S: memberId },
                name:                      { S: body.name                       || "" },
                role:                      { S: body.role                       || "" },
                contributions:             { S: body.contributions              || "" },
                "contribution 2":          { S: body["contribution 2"]          || "" },
                "contribution 3":          { S: body["contribution 3"]          || "" },
                "additional contributions":{ S: body["additional contributions"]|| "" },
                linkedin:                  { S: body.linkedin                   || "" },
                github:                    { S: body.github                     || "" },
                website:                   { S: body.website                    || "" },
                "any additional information": { S: body["any additional information"] || "" },
                status:                    { S: "pending" },
                submittedAt:               { S: new Date().toISOString() }
            }
        }));

        // Send approval email to president
        await ses.send(new SendEmailCommand({
            Source: PRESIDENT_EMAIL,
            Destination: { ToAddresses: [PRESIDENT_EMAIL] },
            Message: {
                Subject: { Data: `New Featured Member Submission: ${body.name}` },
                Body: {
                    Html: {
                        Data: `
                            <h2 style="color:#00f0ff;font-family:sans-serif;">
                                New Featured Member Submission
                            </h2>
                            <table style="font-family:sans-serif;font-size:15px;border-collapse:collapse;">
                                <tr><td style="padding:6px;font-weight:bold;">Name</td><td style="padding:6px;">${body.name}</td></tr>
                                <tr><td style="padding:6px;font-weight:bold;">Role</td><td style="padding:6px;">${body.role || "N/A"}</td></tr>
                                <tr><td style="padding:6px;font-weight:bold;">Contribution 1</td><td style="padding:6px;">${body.contributions || "N/A"}</td></tr>
                                <tr><td style="padding:6px;font-weight:bold;">Contribution 2</td><td style="padding:6px;">${body["contribution 2"] || "N/A"}</td></tr>
                                <tr><td style="padding:6px;font-weight:bold;">Contribution 3</td><td style="padding:6px;">${body["contribution 3"] || "N/A"}</td></tr>
                                <tr><td style="padding:6px;font-weight:bold;">Additional</td><td style="padding:6px;">${body["additional contributions"] || "N/A"}</td></tr>
                                <tr><td style="padding:6px;font-weight:bold;">LinkedIn</td><td style="padding:6px;">${body.linkedin || "N/A"}</td></tr>
                                <tr><td style="padding:6px;font-weight:bold;">GitHub</td><td style="padding:6px;">${body.github || "N/A"}</td></tr>
                                <tr><td style="padding:6px;font-weight:bold;">Website</td><td style="padding:6px;">${body.website || "N/A"}</td></tr>
                                <tr><td style="padding:6px;font-weight:bold;">Extra Info</td><td style="padding:6px;">${body["any additional information"] || "N/A"}</td></tr>
                            </table>
                            <br/>
                            <a href="${APPROVE_BASE_URL}?memberId=${memberId}&action=approve"
                               style="background:#00f0ff;color:#0b0f1a;padding:12px 24px;border-radius:50px;
                                      text-decoration:none;font-weight:bold;font-family:sans-serif;margin-right:12px;">
                                Approve
                            </a>
                            <a href="${APPROVE_BASE_URL}?memberId=${memberId}&action=deny"
                               style="background:#ff4444;color:#fff;padding:12px 24px;border-radius:50px;
                                      text-decoration:none;font-weight:bold;font-family:sans-serif;">
                                Deny
                            </a>
                        `
                    }
                }
            }
        }));

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: "Submission received! The president will review it shortly."
            })
        };

    } catch (err) {
        console.error("submitMember error:", err);
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: "Submission failed. Please try again." })
        };
    }
};
