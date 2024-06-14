import { ChatOpenAI } from "@langchain/openai";
import {ChatPromptTemplate} from "@langchain/core/prompts"

import {Document} from "@langchain/core/documents"

import { createStuffDocumentsChain } from "langchain/chains/combine_documents";

import * as dotenv from "dotenv"
dotenv.config()


const model=new ChatOpenAI({
    model:"gpt-4",
    temperature: 0.7
})

const docA= new Document({
    pageContent:`LangChain Expression Language, or LCEL, is a declarative way to easily compose chains together. LCEL was designed from day 1 to support putting prototypes in production, with no code changes, from the simplest “prompt + LLM” chain to the most complex chains (we’ve seen folks successfully run LCEL chains with 100s of steps in production). To highlight a few of the reasons you might want to use LCEL:

First-class streaming support When you build your chains with LCEL you get the best possible time-to-first-token (time elapsed until the first chunk of output comes out). For some chains this means eg. we stream tokens straight from an LLM to a streaming output parser, and you get back parsed, incremental chunks of output at the same rate as the LLM provider outputs the raw tokens.

Optimized parallel execution Whenever your LCEL chains have steps that can be executed in parallel (eg if you fetch documents from multiple retrievers) we automatically do it for the smallest possible latency.

Retries and fallbacks Configure retries and fallbacks for any part of your LCEL chain. This is a great way to make your chains more reliable at scale. We’re currently working on adding streaming support for retries/fallbacks, so you can get the added reliability without any latency cost.

Access intermediate results For more complex chains it’s often very useful to access the results of intermediate steps even before the final output is produced. This can be used to let end-users know something is happening, or even just to debug your chain. You can stream intermediate results, and it’s available on every LangServe server.

Input and output schemas Input and output schemas give every LCEL chain schemas inferred from the structure of your chain. This can be used for validation of inputs and outputs, and is an integral part of LangServe.

Seamless LangSmith tracing As your chains get more and more complex, it becomes increasingly important to understand what exactly is happening at every step. With LCEL, all steps are automatically logged to LangSmith for maximum observability and debuggability.`
})
const docB= new Document({
    pageContent:`Language models that use a sequence of messages as inputs and return chat messages as outputs (as opposed to using plain text). These are traditionally newer models (older models are generally LLMs, see below). Chat models support the assignment of distinct roles to conversation messages, helping to distinguish messages from the AI, users, and instructions such as system messages.

Although the underlying models are messages in, message out, the LangChain wrappers also allow these models to take a string as input. This gives them the same interface as LLMs (and simpler to use). When a string is passed in as input, it will be converted to a HumanMessage under the hood before being passed to the underlying model.

LangChain does not host any Chat Models, rather we rely on third party integrations.

We have some standardized parameters when constructing ChatModels:

model: the name of the model
Chat Models also accept other parameters that are specific to that integration.

For specifics on how to use chat models, see the relevant how-to guides here.`
})

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
    input:"whatb is Language model?",
    context:[docA,docB]
})

console.log(response)