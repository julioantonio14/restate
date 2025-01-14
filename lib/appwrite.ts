import {
    Account,
    Avatars,
    Client,
    Databases,
    OAuthProvider,
    Query,
} from "react-native-appwrite";
import * as Linking from "expo-linking";
import { openAuthSessionAsync } from "expo-web-browser";

export const config = {
    platform: "com.jsm.restate",
    endpoint: "https://cloud.appwrite.io/v1",
    projectId: "6775b01e00087383f760",
    databaseId: "67797a690001c5750319",
    galleriesCollectionId: "67797c3f003c5d1e3885",
    reviewsCollectionId: "67797c7d000f282c4071",
    agentsCollectionId: "67797b78001b57746552",
    propertiesCollectionId: "67797d6b00381c83e283",
};

export const client = new Client();

const endpoint = config.endpoint || "https://cloud.appwrite.io/v1";
const projectId = config.projectId || "6775b01e00087383f760";
const platform = config.platform || "com.jsm.restate";

client.setEndpoint(endpoint).setProject(projectId).setPlatform(platform);

console.log("Configuração:", config);

//client.setEndpoint(config.endpoint!).setProject(config.projectId!).setPlatform(config.platform);

export const avatar = new Avatars(client);
export const account = new Account(client);
export const databases = new Databases(client);

export async function login() {
    try {
        //const redirectUri = Linking.createURL('/', { isTripleSlashed: false });
        /* const redirectUri = new URL(
            Linking.createURL("/", { isTripleSlashed: false })
        ); */
        const redirectUri = Linking.createURL("index", { isTripleSlashed: false });
        /* if (!redirectUri.hostname) {
            redirectUri.hostname = "localhost";
        } */
        const response = await account.createOAuth2Token(
            OAuthProvider.Google,
            redirectUri.toString()
        );

        if (!response) {
            throw new Error("Failed to login");
        }

        const browserResult = await openAuthSessionAsync(
            response.toString(),
            redirectUri.toString()
        );
        if (browserResult.type !== "success")
            throw new Error("Create OAuth2 token failed");

        const url = new URL(browserResult.url);
        const secret = url.searchParams.get("secret")?.toString();
        const userId = url.searchParams.get("userId")?.toString();

        if (!secret || !userId) {
            throw new Error("Failed to login");
        }

        const session = await account.createSession(userId, secret);
        if (!session) {
            throw new Error("Failed to create session");
        }

        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export async function logout() {
    try {
        const result = await account.deleteSession("current");
        return result;
    } catch (error) {
        console.error(error);
        return false;
    }
}

export async function getCurrentUser() {
    try {
        const result = await account.get();
        if (result.$id) {
            const userAvatar = avatar.getInitials(result.name);

            return {
                ...result,
                avatar: userAvatar.toString(),
            };
        }

        return null;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export async function getLatestProperties() {
    try {
        const result = await databases.listDocuments(
            config.databaseId!,
            config.propertiesCollectionId!,
            [Query.orderAsc("$createdAt"), Query.limit(5)]
        );

        return result.documents;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getProperties({
    filter,
    query,
    limit,
}: {
    filter: string;
    query: string;
    limit?: number;
}) {
    try {
        const buildQuery = [Query.orderDesc("$createdAt")];
        if (filter && filter !== "All")
            buildQuery.push(Query.equal("type", filter));
        if (query) {
            buildQuery.push(
                Query.or([
                    Query.search("name", query),
                    Query.search("address", query),
                    Query.search("type", query),
                ])
            );
        }

        if (limit) {
            buildQuery.push(Query.limit(limit));
        }

        const result = await databases.listDocuments(
            config.databaseId!,
            config.propertiesCollectionId!,
            buildQuery
        );

        return result.documents;
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function getPropertyById({ id }: { id: string }) {
    try {
        const result = await databases.getDocument(
            config.databaseId!,
            config.propertiesCollectionId!,
            id
        );
        return result;
    } catch (error) {
        console.error(error);
        return null;
    }
}
