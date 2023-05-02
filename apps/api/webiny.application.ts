import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import * as path from "path";

import { CoreOutput, createApiApp } from "@webiny/serverless-cms-aws";

export default createApiApp({
    pulumiResourceNamePrefix: "wby-",
    pulumi: ({ paths, resources, getModule, addResource }) => {
        const core = getModule(CoreOutput);

        const role = new aws.iam.Role("hits-count-fn-role", {
            description: "Hits count Lambda function role.",
            assumeRolePolicy: {
                Version: "2012-10-17",
                Statement: [
                    {
                        Action: "sts:AssumeRole",
                        Principal: {
                            Service: "lambda.amazonaws.com"
                        },
                        Effect: "Allow"
                    }
                ]
            }
        });

        new aws.iam.RolePolicyAttachment(`hits-count-fn-role-basic-execution-policy-attachment`, {
            role,
            policyArn: aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole
        });

        const policy = new aws.iam.Policy("hits-count-fn-policy", {
            description: "Hits count Lambda function policy.",
            policy: {
                Version: "2012-10-17",
                Statement: [
                    {
                        // Not recommended. Always use least-privilege principle.
                        Effect: "Allow",
                        Action: ["*"],
                        Resource: ["*"]
                    }
                ]
            }
        });

        new aws.iam.RolePolicyAttachment("hits-count-fn-role-policy-attachment", {
            role: role.name,
            policyArn: policy.arn
        });

        new aws.lambda.Function("hits-count-fn", {
            runtime: "nodejs14.x",
            handler: "handler.handler",
            description: "A simple Lambda function that counts hits.",
            role: role.arn,
            timeout: 30,
            memorySize: 512,
            code: new pulumi.asset.AssetArchive({
                ".": new pulumi.asset.FileArchive(
                    path.join(paths.workspace, "rest/hitsCount/build")
                )
            }),
            environment: {
                variables: {
                    DB_TABLE: core.primaryDynamodbTableName
                }
            }
        });
    }
});
