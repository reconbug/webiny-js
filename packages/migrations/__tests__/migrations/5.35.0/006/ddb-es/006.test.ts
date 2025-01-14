import { createElasticsearchClient } from "@webiny/project-utils/testing/elasticsearch/client";

import {
    assertNotError,
    createDdbEsMigrationHandler,
    createId,
    delay,
    getDynamoToEsTable,
    getPrimaryDynamoDbTable,
    groupMigrations,
    insertDynamoDbTestData,
    insertDynamoDbTestData as insertTestData,
    logTestNameBeforeEachTest,
    scanTable
} from "~tests/utils";

import { AcoRecords_5_35_0_006, Page } from "~/migrations/5.35.0/006/ddb-es";

import { createdBy, createLocalesData, createTenantsData } from "./006.data";
import { insertElasticsearchTestData } from "~tests/utils/insertElasticsearchTestData";
import { esGetIndexName } from "~/utils";
import { getCompressedData } from "~/migrations/5.35.0/006/utils/getCompressedData";
import { ACO_SEARCH_MODEL_ID, PB_PAGE_TYPE, ROOT_FOLDER } from "~/migrations/5.35.0/006/constants";

jest.retryTimes(0);
jest.setTimeout(900000);

const NUMBER_OF_PAGES = 50;
const INDEX_TYPE = "page-builder";
let numberOfGeneratedPages = 0;

describe("5.35.0-006", () => {
    const ddbTable = getPrimaryDynamoDbTable();
    const ddbToEsTable = getDynamoToEsTable();
    const elasticsearchClient = createElasticsearchClient();

    const ddbPages: Record<string, any>[] = [];
    const ddbEsPages: Record<string, any>[] = [];
    const esPages: any[] = [];

    beforeEach(async () => {
        process.env.ELASTIC_SEARCH_INDEX_PREFIX =
            new Date().toISOString().replace(/\.|\:/g, "-").toLowerCase() + "-";

        await elasticsearchClient.indices.deleteAll();
    });
    afterEach(async () => {
        await elasticsearchClient.indices.deleteAll();
    });

    const insertTestPages = async (numberOfPages = NUMBER_OF_PAGES) => {
        ddbPages.length = 0;
        ddbEsPages.length = 0;
        esPages.length = 0;

        const tenants = createTenantsData().map(tenant => tenant.data.id);
        const testLocales = createLocalesData();

        for (const tenant of tenants) {
            const locales = testLocales
                .filter(item => item.PK === `T#${tenant}#I18N#L`)
                .map(locale => locale.code) as string[];

            for (const locale of locales) {
                for (let index = 0; index < numberOfPages; index++) {
                    const pid = createId();

                    const page = {
                        category: "static",
                        createdBy,
                        createdOn: new Date().toISOString(),
                        editor: "page-builder",
                        id: `${pid}#0001`,
                        locale,
                        tenant,
                        locked: true,
                        ownedBy: createdBy,
                        path: `/untitled-${pid}`,
                        pid,
                        publishedOn: new Date().toISOString(),
                        savedOn: new Date().toISOString(),
                        status: "published",
                        title: `Page ${pid}`,
                        version: 1,
                        webinyVersion: "0.0.0"
                    };

                    ddbPages.push({
                        PK: `T#${tenant}#L#${locale}#PB#P#${pid}`,
                        SK: "L",
                        TYPE: "pb.page.l",
                        _ct: new Date().toISOString(),
                        _et: "PbPages",
                        _md: new Date().toISOString(),
                        content: {
                            compression: "jsonpack",
                            content: `id|e2BqxFH8H4|type|document|data|settings|elements|91eudXC1XO|block|width|desktop|value|100%25|margin|top|0px|right|bottom|left|advanced|padding|all|10px|horizontalAlignFlex|center|verticalAlign|flex-start|Bol7kLmyfW|grid|1100px|cellsType|12|gridSettings|flexDirection|row|mobile-landscape|column|DOZwsXszAT|cell|size|asWyIzGneq|heading|text|typography|heading1|alignment|tag|h1|{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Heading+${pid}","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}|path|csorhPDr6y|paragraph|paragraph1|p|{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Lorem+ipsum+dolor+sit+amet.+","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}^C^^$0|1|2|3|4|$5|$]]|6|@$0|7|2|8|4|$5|$9|$A|$B|C]]|D|$A|$E|F|G|F|H|F|I|F|J|-1]]|K|$A|$L|M]]|N|$A|O]|P|$A|Q]]]|6|@$0|R|2|S|4|$5|$9|$A|$B|T]]|D|$A|$E|F|G|F|H|F|I|F|J|-1]]|K|$A|$L|M]]|S|$U|V]|W|$A|$X|Y]|Z|$X|10]]|N|$A|Q]|P|$A|Q]]]|6|@$0|11|2|12|4|$5|$D|$A|$E|F|G|F|H|F|I|F|J|-1]]|K|$A|$L|F]]|S|$13|1J]|N|$A|Q]]]|6|@$0|14|2|15|4|$16|$A|$2|15|17|18|19|I|1A|1B]|4|$16|1C]]|5|$D|$A|$L|F]]|K|$A|$L|F]]]]|6|@]|1D|@1|7|R|11]]|$0|1E|2|1F|4|$16|$A|$2|1F|17|1G|19|I|1A|1H]|4|$16|1I]]|5|$D|$A|$L|F]]|K|$A|$L|F]]]]|6|@]|1D|@1|7|R]]]|1D|@1|7|R]]]|1D|@1|7]]]|1D|@1]]]|1D|@]]`
                        },
                        settings: {
                            general: {
                                image: null,
                                layout: "static",
                                snippet: null,
                                tags: [`tag-${pid}-1`, `tag-${pid}-2`]
                            },
                            seo: {
                                description: null,
                                meta: [],
                                title: null
                            },
                            social: {
                                description: null,
                                image: null,
                                meta: [],
                                title: null
                            }
                        },
                        ...page
                    });

                    ddbEsPages.push({
                        PK: `T#${tenant}#L#${locale}#PB#P#${pid}`,
                        SK: "L",
                        index: `${tenant.toLowerCase()}-${locale.toLowerCase()}-page-builder`,
                        _ct: "2023-04-05T09:37:05.038Z",
                        _et: "PbPagesEs",
                        _md: "2023-04-05T09:37:05.038Z",
                        data: {
                            __type: "page",
                            latest: true,
                            titleLC: page.title.toLowerCase(),
                            tags: [],
                            snippet: null,
                            images: null,
                            ...page
                        }
                    });

                    esPages.push({
                        __type: "page",
                        latest: true,
                        titleLC: page.title.toLowerCase(),
                        tags: [],
                        snippet: null,
                        images: null,
                        ...page
                    });
                }

                // Inserting useful data: latest page record
                await insertDynamoDbTestData(ddbTable, ddbPages);
                await insertDynamoDbTestData(ddbToEsTable, ddbEsPages);
                await insertElasticsearchTestData<Page>(elasticsearchClient, esPages, item => {
                    return esGetIndexName({
                        tenant: item.tenant,
                        locale: item.locale,
                        type: INDEX_TYPE
                    });
                });

                // Track generated files
                numberOfGeneratedPages += numberOfPages;
            }
        }
    };

    logTestNameBeforeEachTest();

    it("should not run if no tenant found", async () => {
        const handler = createDdbEsMigrationHandler({
            primaryTable: ddbTable,
            dynamoToEsTable: ddbToEsTable,
            elasticsearchClient,
            migrations: [AcoRecords_5_35_0_006]
        });

        const { data, error } = await handler();

        assertNotError(error);
        const grouped = groupMigrations(data.migrations);

        expect(grouped.executed.length).toBe(0);
        expect(grouped.skipped.length).toBe(1);
        expect(grouped.notApplicable.length).toBe(0);
    });

    it("should not run if no locale found", async () => {
        await insertTestData(ddbTable, [...createTenantsData()]);

        const handler = createDdbEsMigrationHandler({
            primaryTable: ddbTable,
            dynamoToEsTable: ddbToEsTable,
            elasticsearchClient,
            migrations: [AcoRecords_5_35_0_006]
        });

        const { data, error } = await handler();

        assertNotError(error);
        const grouped = groupMigrations(data.migrations);

        expect(grouped.executed.length).toBe(0);
        expect(grouped.skipped.length).toBe(1);
        expect(grouped.notApplicable.length).toBe(0);
    });

    it("should not run if no pages found", async () => {
        await insertTestData(ddbTable, [...createTenantsData(), ...createLocalesData()]);

        const handler = createDdbEsMigrationHandler({
            primaryTable: ddbTable,
            dynamoToEsTable: ddbToEsTable,
            elasticsearchClient,
            migrations: [AcoRecords_5_35_0_006]
        });

        const { data, error } = await handler();

        assertNotError(error);
        const grouped = groupMigrations(data.migrations);

        expect(grouped.executed.length).toBe(0);
        expect(grouped.skipped.length).toBe(1);
        expect(grouped.notApplicable.length).toBe(0);
    });

    it("should execute migration", async () => {
        await insertTestData(ddbTable, [...createTenantsData(), ...createLocalesData()]);
        await insertTestPages();
        await delay(3000);

        const handler = createDdbEsMigrationHandler({
            primaryTable: ddbTable,
            dynamoToEsTable: ddbToEsTable,
            elasticsearchClient,
            migrations: [AcoRecords_5_35_0_006]
        });

        const { data, error } = await handler();

        assertNotError(error);
        const grouped = groupMigrations(data.migrations);

        expect(grouped.executed.length).toBe(1);
        expect(grouped.skipped.length).toBe(0);
        expect(grouped.notApplicable.length).toBe(0);

        const ddbSearchRecords = await scanTable(ddbTable, {
            entity: "CmsEntries",
            filters: [
                {
                    attr: "modelId",
                    eq: "acoSearchRecord"
                }
            ]
        });

        const ddbEsSearchRecords = await scanTable(ddbToEsTable, {
            entity: "CmsEntriesElasticsearch",
            filters: [
                {
                    attr: "index",
                    contains: "acosearchrecord"
                }
            ]
        });

        expect(ddbSearchRecords.length).toBe(numberOfGeneratedPages * 2);
        expect(ddbEsSearchRecords.length).toBe(numberOfGeneratedPages);

        for (const page of ddbPages) {
            const {
                createdBy,
                createdOn,
                id,
                locale,
                locked,
                path,
                pid,
                savedOn,
                status,
                tenant,
                title,
                version,
                webinyVersion
            } = page;

            const ddbSearchRecord = ddbSearchRecords.find(
                record => record.id === `wby-aco-${pid}#0001`
            );
            const ddbEsSearchRecord = ddbEsSearchRecords.find(
                record => record.PK === `T#${tenant}#L#${locale}#CMS#CME#wby-aco-${pid}`
            );

            // Checking DDB ACO search record
            expect(ddbSearchRecord).toMatchObject({
                PK: `T#${tenant}#L#${locale}#CMS#CME#wby-aco-${pid}`,
                SK: "L",
                TYPE: "L",
                entryId: `wby-aco-${pid}`,
                id: `wby-aco-${pid}#0001`,
                locale,
                tenant,
                version: 1,
                webinyVersion,
                values: {
                    "text@title": title,
                    "text@content": `${title} Heading ${pid} Lorem ipsum dolor sit amet.`,
                    "text@type": PB_PAGE_TYPE,
                    "object@location": {
                        "text@folderId": ROOT_FOLDER
                    },
                    "text@tags": [`tag-${pid}-1`, `tag-${pid}-2`],
                    "wby-aco-json@data": {
                        createdBy,
                        createdOn,
                        id,
                        locked,
                        path,
                        pid,
                        savedOn,
                        status,
                        title,
                        version
                    }
                }
            });

            const data = await getCompressedData({
                modelId: ACO_SEARCH_MODEL_ID,
                version: 1,
                savedOn,
                locale,
                status: "draft",
                values: {
                    "text@type": PB_PAGE_TYPE,
                    "text@title": title,
                    "text@content": `${title} Heading ${pid} Lorem ipsum dolor sit amet.`,
                    "text@tags": [`tag-${pid}-1`, `tag-${pid}-2`],
                    "object@location": {
                        "text@folderId": ROOT_FOLDER
                    },
                    "wby-aco-json@data": {
                        id: `${pid}#0001`,
                        pid,
                        title,
                        createdBy,
                        createdOn,
                        savedOn,
                        status,
                        version,
                        locked,
                        path
                    }
                },
                createdBy,
                entryId: `wby-aco-${pid}`,
                tenant,
                createdOn,
                locked: false,
                ownedBy: createdBy,
                webinyVersion: process.env.WEBINY_VERSION,
                id: `wby-aco-${pid}#0001`,
                modifiedBy: createdBy,
                latest: true,
                TYPE: "cms.entry.l",
                __type: "cms.entry.l",
                rawValues: {
                    "object@location": {}
                }
            });

            // Checking DDB + ES ACO search record
            expect(ddbEsSearchRecord).toMatchObject({
                PK: `T#${tenant}#L#${locale}#CMS#CME#wby-aco-${pid}`,
                SK: "L",
                index: esGetIndexName({
                    tenant,
                    locale,
                    type: "acosearchrecord",
                    isHeadlessCmsModel: true
                }),
                data
            });
        }
    });

    it("should not run migration if data is already in the expected shape", async () => {
        await insertTestData(ddbTable, [...createTenantsData(), ...createLocalesData()]);
        await insertTestPages(1);

        const handler = createDdbEsMigrationHandler({
            primaryTable: ddbTable,
            dynamoToEsTable: ddbToEsTable,
            elasticsearchClient,
            migrations: [AcoRecords_5_35_0_006]
        });

        // Should run the migration
        {
            process.stdout.write("[First run]\n");
            const { data, error } = await handler();
            assertNotError(error);
            const grouped = groupMigrations(data.migrations);
            expect(grouped.executed.length).toBe(1);
        }

        // Should skip the migration
        {
            process.stdout.write("[Second run]\n");
            const { data, error } = await handler();
            assertNotError(error);
            const grouped = groupMigrations(data.migrations);
            expect(grouped.executed.length).toBe(0);
            expect(grouped.skipped.length).toBe(1);
            expect(grouped.notApplicable.length).toBe(0);
        }
    });
});
