import { chatSession } from '@/configs/AIModel';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { useAction, useMutation } from 'convex/react';
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, Code, Heading1, Heading2, Heading3, Italic, List, ListOrdered, Redo, Sparkles, Strikethrough, Subscript, Superscript, Underline, Undo } from 'lucide-react'
import { useParams } from 'next/navigation';
import React from 'react'
import { toast } from 'sonner';


function EditorExtension({editor}) {
  

    const {fileId} = useParams();
    console.log("File ID from params:", fileId);
    const SearchAI= useAction(api.myAction.search);
    const SaveNotes= useMutation(api.notes.AddNotes);
    const{user} = useUser();


    const  onAiClick=async()=>{
        //console.log("Ai button click")
        toast("AI is getting your answer");

        const selectedText = editor.state.doc.textBetween(
            editor.state.selection.from,
            editor.state.selection.to,
            ' '
        );
        console.log("selectedText: ",selectedText);

        const result = await SearchAI({
            query:selectedText,
            fileId:fileId
        })

        const UnformattedAns=JSON.parse(result);
        let AllUnformattedAns='';
        UnformattedAns&&UnformattedAns.forEach(item=>{
            AllUnformattedAns=AllUnformattedAns+item.pageContent
        });

        const PROMPT ="For question: "+selectedText+" and with given content as answer,"+
        "please give appropriate answer in HTML format. The answer content is: "+AllUnformattedAns;

        console.log("AllUnformattedAns",AllUnformattedAns)

        const AiModelResult = await chatSession.sendMessage(PROMPT);
        console.log(AiModelResult.response.text());
        
        let FinalAns = AiModelResult.response.text()
        .replace(/```/g, '') // Remove code block markers (``` text ``` or similar)
        .replace(/\n+/g, ' ') // Replace multiple newlines with a single space
        .replace(/\s{2,}/g, ' ') // Replace multiple spaces with a single space
        .trim(); // Remove any leading or trailing whitespace

    // Extract the content inside the <p> tag (assuming it's within the <p>...</p>)
    const regex = /<body[^>]*>(.*?)<\/body>/s;
    const match = FinalAns.match(regex);
    if (match) {
        FinalAns = match[1]; // Extract the content inside <body> tag
    }

        const AllText= editor.getHTML();
        editor.commands.setContent(AllText+'<p><strong>Answer: </strong>'+FinalAns+'</p');

        //console.log("unformatted ans:", result);

        SaveNotes({
          notes:editor.getHTML(),
          fileId:fileId,
            createdBy:user?.primaryEmailAddress?.emailAddress
        })

    }
    
  return editor&&(
    <div className='p-5'>
        <div className="control-group">
        <div className="button-group flex gap-2">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'text-blue-500' : ''}
          >
            <Bold/>
          </button>

          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'text-blue-500' : ''}
          >
            <Italic/>
          </button>

          <button 
            onClick={() => editor.chain().focus().toggleCode().run()} 
            className={editor.isActive('code') ? 'text-blue-500' : ''}
          >
            <Code />
          </button>

          <button 
            onClick={() => editor.chain().focus().toggleUnderline().run()} 
            className={editor.isActive('underline') ? 'text-blue-500' : ''}
          >
            <Underline />
          </button>

          <button onClick={() => editor.chain().focus().setTextAlign('left').run()}>
            <AlignLeft />
          </button>
          <button onClick={() => editor.chain().focus().setTextAlign('center').run()}>
            <AlignCenter />
          </button>
          <button onClick={() => editor.chain().focus().setTextAlign('right').run()}>
            <AlignRight />
          </button>
          <button onClick={() => editor.chain().focus().setTextAlign('justify').run()}>
            <AlignJustify />
          </button>


          <button 
            onClick={() => editor.chain().focus().toggleStrike().run()} 
            className={editor.isActive('strike') ? 'text-blue-500' : ''}
          >
            <Strikethrough />
          </button>

          <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
            <Heading1 />
          </button>
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
            <Heading2 />
          </button>
          <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
            <Heading3 />
          </button>

          

          {/* Undo & Redo */}
          <button onClick={() => editor.chain().focus().undo().run()}>
            <Undo />
          </button>
          <button onClick={() => editor.chain().focus().redo().run()}>
            <Redo />
          </button>

          <button 
            onClick={() => onAiClick()} 
            className={'hover:text-blue-500'}
          >
            <Sparkles/>
          </button>

          </div>
          </div>
    </div>
  )
}

export default EditorExtension