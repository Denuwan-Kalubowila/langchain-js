import weaviate from 'weaviate-client';
import * as dotenv from "dotenv";
import { WeaviateStore } from "@langchain/weaviate";
import { OpenAIEmbeddings } from "@langchain/openai";
dotenv.config();

const openaiApiKey = process.env.OPENAI_API_KEY || '';

const client = await weaviate.connectToWeaviateCloud(
    process.env.WEAVIATE_INSTANCE_URL || "",
    {
        authCredentials: new weaviate.ApiKey(process.env.WEAVIATE_INSTANCE_APIKEY || ""),
        headers: {
            'X-OpenAI-Api-Key': openaiApiKey, // Remove if not using OpenAI
        }
    }
);

const collection = async ()=>{
  await client.collections.create({
    name: 'DemoCollection',
    properties: [
        {
            name: "title",
            dataType: "text",
        },
    ],
    vectorizers: [
        weaviate.configure.vectorizer.text2VecOpenAI({
            name: 'title_vector',
            sourceProperties: ['title'],
        }),
    ],
  })
}

async function insertData() {
    const collectionName = 'DemoCollection';
    const myCollection = await client.collections.get(collectionName);

    let dataObjects = [
      { title: 'Wishwa is good' },
      { title: 'Nayana is bad' },
      { title: 'Denuwan is good ' },
      { title: 'Supun is good' },
      { title: 'Nimantha is bad' },
      { title: 'Yasas is bad' },
    ]
    const response = await myCollection.data.insertMany(dataObjects);
    
    console.log(response)
}
async function searchData() {
    const collectionName = 'DemoCollection';
    const myCollection = await client.collections.get(collectionName);
    const response = await myCollection.query.nearText(
        "is good",
        {
            limit:3
        }
);
    
    console.log(response.objects)
}

async function run() {
  await WeaviateStore.fromTexts(
    ["hello world", "hi there", "how are you", "bye now"],
    [{ foo: "bar" }, { foo: "baz" }, { foo: "qux" }, { foo: "bar" }],
    new OpenAIEmbeddings(),
    {
      client,
      indexName: "DemoCollection",
      textKey: "text",
      metadataKeys: ["foo"],
    }
  );
}
async function main() {
    try {
        // await collection()
        // await insertData();
        // await searchData()
        await run()
    } catch (err) {
        console.error("Error during main function:", err);
    } finally {
        client.close();
    }
}

main().catch(err => console.error(err));
