import  {ChatOpenAI} from "@langchain/openai"
import * as dotenv from "dotenv"
dotenv.config()

const model = new ChatOpenAI({
    modelName:"gpt-4",
    openAIApiKey:process.env.OPENAI_API_KEY,
    temperature:0.6,
    maxTokens:1000,
    verbose:true
})

const response= await model.invoke("write a sentense for  Sri lanka")

// for await (const chunck of response){
//     console.log(chunck?.content)
// }

console.log(response)