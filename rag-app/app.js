import "cheerio"
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import {ChatPromptTemplate} from "@langchain/core/prompts";
import * as dotenv from "dotenv";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { StringOutputParser} from "@langchain/core/output_parsers";
import weaviate, { ApiKey } from "weaviate-ts-client";
import { WeaviateStore } from "@langchain/weaviate";
import  readline, { createInterface } from "readline"

dotenv.config()

const weaviateClient = weaviate.client({
    scheme: process.env.WEAVIATE_HOST || "https",
    host: process.env.WEAVIATE_INSTANCE_URL || "localhost",
    apiKey: new ApiKey(process.env.WEAVIATE_INSTANCE_APIKEY || "default"),
});

const llm= new ChatOpenAI({
    model:"gpt-4",
    temperature:0.7,
    verbose:true,
})

const loader= new CheerioWebBaseLoader("https://traveltriangle.com/blog/most-beautiful-places-in-sri-lanka/")
const doc = await loader.load()

const textSpliter= new RecursiveCharacterTextSplitter({
    chunkSize:1000,
    chunkOverlap:200,
})
const splits= await textSpliter.splitDocuments(doc)

async function run() {
    const client = weaviateClient
    const wstore=await WeaviateStore.fromDocuments(
      splits,
      new OpenAIEmbeddings(),
      {
        client,
        indexName: "Test",
        textKey: "text",
        metadataKeys: ["foo"],
      }
    );
  
    return wstore
}

const checkSimilarity=async (query)=>{
    const store=await run()
    const retriever =store.similaritySearch(query,5)

    return retriever
}

const createChain=async ()=>{
    try {
        const prompt = ChatPromptTemplate.fromTemplate(
            `Answer the user Questions. 
                Context:{context}
                Question:{input}
            `
        )
        const ragChain = await createStuffDocumentsChain({
            llm,
            prompt: prompt,
            outputParser: new StringOutputParser(),
        });
        return ragChain
    } catch (error) {
        return new Error(error)
    }
    
}

const rl =createInterface({
    input:process.stdin,
    output:process.stdout,
})

const  askQuestion = ()=>{
    rl.question("User : ",async (input)=>{
        if (input.toLowerCase() ==="exit"){
            rl.close()
        }
        const chain = await createChain()
        let retriever= await checkSimilarity(input)
        const res= await chain.invoke({
            input:input,
            context:retriever
        })
        console.log("Agent : ",res)
        askQuestion()
    })
}

askQuestion()