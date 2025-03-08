import { NextResponse } from "next/server";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

//const pdfUrl = "https://determined-ibex-558.convex.cloud/api/storage/c2114fd1-586e-47d1-8680-cff2fac66e45";
export async function GET(req){

    const reqUrl = req.url;
    const {searchParams} = new URL(reqUrl);
    const pdfUrl = searchParams.get('pdfUrl');
    console.log(pdfUrl);

    //1. Load the pdf
    const response = await fetch(pdfUrl);
    const data = await response.blob();
    const loader = new WebPDFLoader(data);
    const docs = await loader.load();

    let pdfTextContent='';
    docs.forEach(doc =>{
        pdfTextContent = pdfTextContent + doc.pageContent;
    })

    //2. Split the text into small chunks
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 100,
        chunkOverlap: 20,
      });

    const output = await splitter.createDocuments([pdfTextContent]);

    let splitterList=[];
    output.forEach(doc=>{
        splitterList.push(doc.pageContent);
    })

    return NextResponse.json({result:splitterList});

}