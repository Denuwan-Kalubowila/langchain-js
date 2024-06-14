import  {ChatOpenAI} from "@langchain/openai"
import {ChatPromptTemplate} from "@langchain/core/prompts"
import * as dotenv from "dotenv"
dotenv.config()

const model = new ChatOpenAI({
    modelName:"gpt-4",
    temperature:0.6,
    openAIApiKey:process.env.OPENAI_API_KEY,
})

// const prompt = ChatPromptTemplate.fromTemplate(
//     "You are a comidian.Tell a joke base on the following word {input}."
// ) prompt template .............................................................................................................................................
const prompt = ChatPromptTemplate.fromMessages([
    ["system","Translate user {input} to {language}"],
    ["human","{input}"],
])

//create chain
const chain= prompt.pipe(model)
const response = await chain.invoke({
    input:"dogs",
    language:"Tamil"
})
console.log(response)