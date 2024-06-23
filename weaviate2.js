import weaviate from 'weaviate-client';
import wiki from 'wikijs';

import * as dotenv from "dotenv";
dotenv.config();

const openaiApiKey = process.env.OPENAI_API_KEY || '';

const client = await weaviate.connectToWeaviateCloud(
  process.env.WEAVIATE_INSTANCE_URL || "",
  {
    authCredentials: new weaviate.ApiKey(process.env.WEAVIATE_INSTANCE_APIKEY || ""),
    headers: {
      'X-OpenAI-Api-Key': openaiApiKey,
    },
  }
);

const collection = async () => {
  await client.collections.create({
    name: 'WikiCollection',
    properties: [
      {
        name: "title",
        dataType: "text",
      },
      {
        name: "content",
        dataType: "text",
      },
    ],
    vectorizers: [
      weaviate.configure.vectorizer.text2VecOpenAI({
        name: 'title_vector',
        sourceProperties: ['title'],
      },
      {
        name: 'content_vector',
        sourceProperties: ['content'],
      })
    ],
  });
};

async function fetchWikipediaArticles(titles) {
  const wikiClient = wiki();
  const articles = [];

  for (const title of titles) {
    try {
      const page = await wikiClient.page(title);
      const content = await page.content(); // Await here for content
      articles.push({ title, content });
    } catch (error) {
      console.error(`Failed to fetch article: ${title}`, error);
    }
  }

  return articles;
}

const insertData = async (dataset) => {
  const collectionName = 'WikiCollection';
  const myCollection = await client.collections.get(collectionName);

  try {
    const response = await myCollection.data.insertMany(dataset);
    console.log("Data inserted successfully:", response); // Handle success
  } catch (error) {
    console.error("Error inserting data:", error); // Handle error
  }
};
async function main() {
    try {
        await collection()
        // const titles = ["nodejs", "python", "Golang"];
        // const articles = await fetchWikipediaArticles(titles);
        // console.log(articles)
    } catch (err) {
        console.error("Error during main function:", err);
    } finally {
        client.close();
    }
}

main().catch(err => console.error(err));
