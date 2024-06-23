import weaviate, { ApiKey } from "weaviate-ts-client";
import { WeaviateStore } from "@langchain/weaviate";
import { OpenAIEmbeddings } from "@langchain/openai";

async function run() {
  // Something wrong with the weaviate-ts-client types, so we need to disable
  const client = (weaviate).client({
    scheme: process.env.WEAVIATE_INSTANCE_HOST || "https",
    host: process.env.WEAVIATE_INSTANCE_URL || "localhost",
    apiKey: new ApiKey(process.env.WEAVIATE_INSTANCE_APIKEY || "default"),
  });

  // Create a store and fill it with some texts + metadata
  await WeaviateStore.fromTexts(
    ["hello world", "hi there", "how are you", "bye now"],
    [{ foo: "bar" }, { foo: "baz" }, { foo: "qux" }, { foo: "bar" }],
    new OpenAIEmbeddings(),
    {
      client,
      indexName: "Test",
      textKey: "text",
      metadataKeys: ["foo"],
    }
  );
}

await run()