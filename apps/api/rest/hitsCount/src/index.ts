const AWS = require("aws-sdk");

export const handler = async event => {
    const ddb = new AWS.DynamoDB.DocumentClient({ region: process.env.AWS_REGION });

    const viewsForPages = event.data;
    for (let i = 0; i < viewsForPages.length; i++) {
        const viewsForPage = viewsForPages[i];

        const PK = `T#${viewsForPage.tenant}#L#${viewsForPage.locale}#PB#P#${viewsForPage.page}`;
        const SK = "P";

        try {
            const params = {
                RequestItems: {
                    [process.env.DB_TABLE]: {
                        Keys: [{ PK, SK }]
                    },
                    [process.env.DB_TABLE_ELASTICSEARCH]: {
                        Keys: [{ PK, SK }]
                    }
                }
            };

            const data = await ddb.batchGet(params).promise();
            const items = data.Responses[process.env.DB_TABLE];
            if (items.length === 0) {
                continue;
            }

            const updateParams = {
                RequestItems: {
                    [process.env.DB_TABLE]: [
                        {
                            PutRequest: {
                                Item: {
                                    ...data.Responses[process.env.DB_TABLE][0],
                                    viewsCount: viewsForPage.viewsCount
                                }
                            }
                        }
                    ],
                    [process.env.DB_TABLE_ELASTICSEARCH]: [
                        {
                            PutRequest: {
                                Item: {
                                    ...data.Responses[process.env.DB_TABLE_ELASTICSEARCH][0],
                                    data: {
                                        ...data.Responses[process.env.DB_TABLE_ELASTICSEARCH][0]
                                            .data,
                                        viewsCount: viewsForPage.viewsCount
                                    }
                                }
                            }
                        }
                    ]
                }
            };

            await ddb.batchWrite(updateParams).promise();
        } catch (err) {
            console.log("Error", err);
        }
    }
};
