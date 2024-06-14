import  {ChatOpenAI} from "@langchain/openai"
import {ChatPromptTemplate} from "@langchain/core/prompts"
import { StringOutputParser,CommaSeparatedListOutputParser } from "@langchain/core/output_parsers";
import * as dotenv from "dotenv"
import { StructuredOutputParser } from "langchain/output_parsers";
import {z} from "zod"
dotenv.config()

const model = new ChatOpenAI({
    modelName:"gpt-4",
    temperature:0.6,
    openAIApiKey:process.env.OPENAI_API_KEY,
})

// const prompt = ChatPromptTemplate.fromTemplate(
//     "You are a comidian.Tell a joke base on the following word {input}."
// ) prompt template .............................................................................................................................................

//output parser for string
const callStringOutputParser=async ()=>{
    const parser= new StringOutputParser()
    const prompt = ChatPromptTemplate.fromMessages([
        ["system","Write a poem useing user {input}"],
        ["human","{input}"],
    ])
    
    //create chain
    const chain= prompt.pipe(model).pipe(parser)
    return await chain.invoke({
        input:"frog",
    })
}
//output parser for string , separated
const callListOutputParser=async ()=>{
    const outputParser=new CommaSeparatedListOutputParser()
    const prompt = ChatPromptTemplate.fromTemplate(
     `Provide 5 synonyms ,separated by commas,for the followinf word {word}`
    )
    const chain = prompt.pipe(model)
    return await chain.invoke({
        word:"Mother",

    })
    
}

//structured output parser
const callStructureParser = async () => {
    // Create the prompt template
    const prompt = ChatPromptTemplate.fromTemplate(
        `Extract information from the following phrase
        Formatting: Instruction: {format_instruction}
        phrase: {phrase}`
    );

    // Create the structured output parser
    const outputParser = StructuredOutputParser.fromNamesAndDescriptions({
        name: "name of the person",
        age: "age of the person",
    });

    // Create the chain
    const chain = prompt.pipe(model).pipe(outputParser);

    // Invoke the chain
    return await chain.invoke({
        phrase: "Denu is 22 years old.",
        format_instruction: outputParser.getFormatInstructions(),
    });
};
const callStructureParserZod = async () => {
    const prompt = ChatPromptTemplate.fromTemplate(
        `Extract information from the following phrase
        Formatting: Instruction: {format_instruction}
        phrase: {phrase}`
    );
    const outputParser = StructuredOutputParser.fromZodSchema(
        z.object({
            recipe: z.string().describe("name of recipe"),
            ingredients: z.array(z.string()).describe("ingredients"), // Fixed typo
        })
    );
    const chain = prompt.pipe(model).pipe(outputParser);
    return await chain.invoke({
        phrase: "the ingredients for chinese fried rice recipe are basmati rice, carrot, onion leaves, soy sauce, chicken fried, salt, chili",
        format_instruction: outputParser.getFormatInstructions(),
    });
}

//const res= await callStringOutputParser()

//const res= await callListOutputParser()

const res= await callStructureParserZod()
console.log(res)