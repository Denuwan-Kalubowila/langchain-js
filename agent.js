import * as dotenv from "dotenv"
dotenv.config()

import {ChatOpenAI} from "@langchain/openai"
import {ChatPromptTemplate,MessagesPlaceholder} from "@langchain/core/prompts"
import { createOpenAIFunctionsAgent,AgentExecutor } from "langchain/agents"
import { TavilySearchResults } from "@langchain/community/tools/tavily_search"
import {AIMessage,HumanMessage} from "@langchain/core/messages"
import  readline, { createInterface } from "readline"

const model = new ChatOpenAI({
    model:"gpt-4",
    temperature:0.7,
})

const chatHistory=[]
const prompt = ChatPromptTemplate.fromMessages([
    ("system","You are helpful assistant called Gmax"),
    new MessagesPlaceholder("chat_history"),
    ("user","{input}"),
    new MessagesPlaceholder("agent_scratchpad"),
])

const searchTool = new TavilySearchResults()
const tools = [searchTool]
const agent = await createOpenAIFunctionsAgent({
    llm:model,
    prompt,
    tools,
})

const agentExcecutor=new AgentExecutor({
    agent,
    tools,
})

const rl =createInterface({
    input:process.stdin,
    output:process.stdout,
})

const  askQuestion = ()=>{
    rl.question("User : ",async (input)=>{
        if (input.toLowerCase() ==="exit"){
            rl.close()
        }
        const res= await agentExcecutor.invoke({
            input:input,
            chat_history:chatHistory
        })
        console.log("Agent : ",res.output)
        chatHistory.push(new AIMessage(res.input))
        chatHistory.push(new HumanMessage(res.output))
        askQuestion()
    })
}

askQuestion()