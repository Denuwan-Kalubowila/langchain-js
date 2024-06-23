import "cheerio"
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import {ChatPromptTemplate} from "@langchain/core/prompts";
import * as dotenv from "dotenv";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { StringOutputParser} from "@langchain/core/output_parsers";

dotenv.config()

const llm= new ChatOpenAI({
    model:"gpt-4",
    temperature:0.7,
    verbose:true,
})

const loader= new CheerioWebBaseLoader("https://blog.postman.com/how-to-create-a-rest-api-with-node-js-and-express/")
const doc = await loader.load()

const textSpliter= new RecursiveCharacterTextSplitter({
    chunkSize:1000,
    chunkOverlap:200,
})
const splits= await textSpliter.splitDocuments(doc)

const vectorStore =await MemoryVectorStore.fromDocuments(
    splits,
    new OpenAIEmbeddings(),
)

const retriever =vectorStore.asRetriever({ 
    k: 6, 
    searchType: "similarity" 
});
const prompt = ChatPromptTemplate.fromTemplate(
    `Answer the user Questions. 
    Context:{context}
    Question:{input}`
)
// const chain =prompt.pipe(model);
const ragChain = await createStuffDocumentsChain({
    llm,
    prompt: prompt,
    outputParser: new StringOutputParser(),
  });
const context = await retriever.invoke("node js ,API ,REST,postman");
  
const response = await ragChain.invoke({
    input: "what is kiriibba",
    context,
  });

console.log(response)