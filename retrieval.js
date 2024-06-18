import { ChatOpenAI } from "@langchain/openai";
import {ChatPromptTemplate} from "@langchain/core/prompts"
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";

import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import * as dotenv from "dotenv"
dotenv.config()


const model=new ChatOpenAI({
    model:"gpt-4",
    temperature: 0.7
})

const loader = new CheerioWebBaseLoader("https://en.wikipedia.org/wiki/Ratnapura")

const datadoc=await loader.load()

const prompt = ChatPromptTemplate.fromTemplate(
    `Answer the user Questions. 
    Context:{context}
    Question:{input}`
)
// const chain =prompt.pipe(model);
const chain =await createStuffDocumentsChain({
    llm:model,
    prompt
})

const response= await chain.invoke({
    input:"what is the reason most in ratnapura?",
    context:datadoc
})

console.log(response)