import { ConvexVectorStore } from "@langchain/community/vectorstores/convex";
import { action } from "./_generated/server.js";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { v } from "convex/values";

export const ingest = action({
    args: {
      splitText: v.any(),
      fileId: v.string(),
    },
    handler: async (ctx, args) => {
      console.log("Ingesting splitText:", args.splitText);
  
      // ✅ Define metadata object
      const metadata = { fileId: args.fileId };
      console.log("Generated Metadata:", metadata); // ✅ Log metadata
  
      // ✅ Pass metadata correctly
      const vectorStore = await ConvexVectorStore.fromTexts(
        args.splitText, // Array
        metadata, // ✅ Pass metadata object
        new GoogleGenerativeAIEmbeddings({
          apiKey: "AIzaSyCUF4z0fuuSnCaoGBpGrrMQNaHfNgiRC1A",
          model: "text-embedding-004", // 768 dimensions
          taskType: TaskType.RETRIEVAL_DOCUMENT,
          title: "Document title",
        }),
        { ctx }
      );
  
      console.log("VectorStore created:", vectorStore);
      console.log("Ingestion completed...");
      
      return { status: "completed", metadata }; // ✅ Return metadata for debugging
    },
  });

  export const search = action({
    args: {
      query: v.string(),
      fileId: v.string(),
    },
    handler: async (ctx, args) => {
      const vectorStore = new ConvexVectorStore(new GoogleGenerativeAIEmbeddings({
        apiKey: 'AIzaSyCUF4z0fuuSnCaoGBpGrrMQNaHfNgiRC1A',
        model: "text-embedding-004", // 768 dimensions
        taskType: TaskType.RETRIEVAL_DOCUMENT,
        title: "Document title",
      }), { ctx });
  
      console.log('Searching with query:', args.query);
      console.log('Searching in file:', args.fileId);
  
      const resultOne = await vectorStore.similaritySearch(args.query, 1);
  
      console.log("Raw Results:", JSON.stringify(resultOne, null, 2));

      //resultOne.forEach((q, index) => {
        //console.log(`Result ${index + 1} metadata:`, JSON.stringify(q.metadata, null, 2));
      //});
  
      // Ensure metadata exists before filtering
      const filteredResults = resultOne.filter(q => q.metadata?.fileId === args.fileId);
  
      console.log("Filtered Results:", JSON.stringify(filteredResults, null, 2));
  
      return JSON.stringify(filteredResults);
    },
  });