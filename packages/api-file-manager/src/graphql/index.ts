import {
    Response,
    ErrorResponse,
    ListResponse,
    GraphQLSchemaPlugin
} from "@webiny/handler-graphql";
import { FileManagerContext, FilesListOpts } from "~/types";

const emptyResolver = () => ({});

/**
 * Use any because it really can be any.
 * TODO @ts-refactor maybe use generics at some point?
 */
interface ResolveCallable {
    (): Promise<any>;
}

const resolve = async (fn: ResolveCallable) => {
    try {
        return new Response(await fn());
    } catch (e) {
        return new ErrorResponse(e);
    }
};

export const createGraphQLSchemaPlugin = () => {
    const fileManagerGraphQL = new GraphQLSchemaPlugin<FileManagerContext>({
        typeDefs: /* GraphQL */ `
            type FmCreatedBy {
                id: ID
                displayName: String
            }

            input CreateFileInput {
                id: ID!
                key: String!
                name: String!
                size: Long!
                type: String!
                tags: [String!]
                aliases: [String!]
                meta: JSON
            }

            input UpdateFileInput {
                key: String
                name: String
                size: Long
                type: String
                tags: [String!]
                aliases: [String!]
                meta: JSON
            }

            type UploadFileResponseDataFile {
                id: ID!
                name: String!
                type: String!
                size: Long!
                key: String!
            }

            type UploadFileResponseData {
                # Contains data that is necessary for initiating a file upload.
                data: JSON
                file: UploadFileResponseDataFile
            }

            type FileListMeta {
                cursor: String
                totalCount: Int
                hasMoreItems: Boolean
            }

            type FileError {
                code: String
                message: String
                data: JSON
                stack: String
            }

            type FileListResponse {
                data: [File]
                meta: FileListMeta
                error: FileError
            }

            type FileResponse {
                data: File
                error: FileError
            }

            type CreateFilesResponse {
                data: [File!]
                error: FileError
            }

            type File {
                id: ID!
                key: String!
                name: String!
                size: Long!
                type: String!
                src: String!
                tags: [String!]
                aliases: [String!]
                meta: JSON
                createdOn: DateTime
                createdBy: FmCreatedBy
            }

            type FileManagerBooleanResponse {
                data: Boolean
                error: FileError
            }

            type FileManagerSettings {
                uploadMinFileSize: Number
                uploadMaxFileSize: Number
                srcPrefix: String
            }

            input FileManagerSettingsInput {
                uploadMinFileSize: Number
                uploadMaxFileSize: Number
                srcPrefix: String
            }

            type FileManagerSettingsResponse {
                data: FileManagerSettings
                error: FileError
            }

            input FileWhereInput {
                search: String
                type: String
                type_in: [String!]
                tag: String
                tag_in: [String!]
                tag_and_in: [String!]
                tag_startsWith: String
                tag_not_startsWith: String
                id_in: [ID!]
                id: ID
                createdBy: ID
            }

            input TagWhereInput {
                tag_startsWith: String
                tag_not_startsWith: String
            }

            type ListTagResponseItem {
                tag: String!
                count: Number!
            }

            type ListTagsResponse {
                data: [ListTagResponseItem!]
                error: FileError
            }

            type FmQuery {
                getFile(id: ID, where: JSON, sort: String): FileResponse

                listFiles(
                    limit: Int
                    after: String
                    types: [String]
                    tags: [String]
                    ids: [ID]
                    search: String
                    where: FileWhereInput
                ): FileListResponse

                listTags(where: TagWhereInput): ListTagsResponse!

                # Get installed version
                version: String

                getSettings: FileManagerSettingsResponse
            }

            type FilesDeleteResponse {
                data: Boolean
                error: FileError
            }

            type FmMutation {
                createFile(data: CreateFileInput!, meta: JSON): FileResponse
                createFiles(data: [CreateFileInput]!, meta: JSON): CreateFilesResponse
                updateFile(id: ID!, data: UpdateFileInput!): FileResponse
                deleteFile(id: ID!): FilesDeleteResponse
                install(srcPrefix: String): FileManagerBooleanResponse
                updateSettings(data: FileManagerSettingsInput): FileManagerSettingsResponse
            }

            input FilesInstallInput {
                srcPrefix: String!
            }

            extend type Query {
                fileManager: FmQuery
            }

            extend type Mutation {
                fileManager: FmMutation
            }
        `,
        resolvers: {
            File: {
                async src(file, _, context: FileManagerContext) {
                    const settings = await context.fileManager.getSettings();
                    return (settings?.srcPrefix || "") + file.key;
                }
            },
            Query: {
                fileManager: emptyResolver
            },
            Mutation: {
                fileManager: emptyResolver
            },
            FmQuery: {
                getFile(_, args: any, context) {
                    return resolve(() => context.fileManager.getFile(args.id));
                },
                async listFiles(_, args: FilesListOpts, context) {
                    try {
                        const [data, meta] = await context.fileManager.listFiles(args);
                        return new ListResponse(data, meta);
                    } catch (e) {
                        return new ErrorResponse(e);
                    }
                },
                async listTags(_, args: any, context) {
                    try {
                        const tags = await context.fileManager.listTags(args || {});

                        return new Response(tags);
                    } catch (error) {
                        return new ErrorResponse(error);
                    }
                },
                async version(_, __, context) {
                    const { i18n, tenancy, fileManager } = context;
                    if (!tenancy.getCurrentTenant() || !i18n.getContentLocale()) {
                        return null;
                    }

                    return await fileManager.getVersion();
                },
                async getSettings(_, __, context) {
                    return resolve(() => context.fileManager.getSettings());
                }
            },
            FmMutation: {
                async createFile(_, args: any, context) {
                    return resolve(() => context.fileManager.createFile(args.data, args.meta));
                },
                async updateFile(_, args: any, context) {
                    return resolve(() => context.fileManager.updateFile(args.id, args.data));
                },
                async createFiles(_, args: any, context) {
                    return resolve(() =>
                        context.fileManager.createFilesInBatch(args.data, args.meta)
                    );
                },
                async deleteFile(_, args: any, context) {
                    return resolve(async () => {
                        // TODO: Ideally, this should work via a lifecycle hook; first we delete a record from DB, then from cloud storage.
                        const file = await context.fileManager.getFile(args.id);
                        return await context.fileManager.storage.delete({
                            id: file.id,
                            key: file.key
                        });
                    });
                },
                async install(_, args: any, context) {
                    return resolve(() =>
                        context.fileManager.install({ srcPrefix: args.srcPrefix })
                    );
                },
                async updateSettings(_, args: any, context) {
                    return resolve(() => context.fileManager.updateSettings(args.data));
                }
            }
        }
    });
    fileManagerGraphQL.name = "fm.graphql.schema";

    return fileManagerGraphQL;
};
