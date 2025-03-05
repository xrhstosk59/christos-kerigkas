'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import { useTheme } from './theme-provider'
import type { Components } from 'react-markdown'
import { Highlight, themes } from 'prism-react-renderer'

interface MarkdownProps {
 content: string
}

export function Markdown({ content }: MarkdownProps) {
 const { theme } = useTheme()
 
 const components: Components = {
   code({ className, children, ...props }) {
     const match = /language-(\w+)/.exec(className || '')
     const language = match ? match[1] : ''
     
     if (language) {
       return (
         <Highlight
           theme={theme === 'dark' ? themes.nightOwl : themes.github}
           code={String(children).replace(/\n$/, '')}
           language={language}
         >
           {({ className, style, tokens, getLineProps, getTokenProps }) => (
             <pre className={`${className} overflow-auto rounded-lg p-4`} style={style}>
               {tokens.map((line, i) => (
                 <div key={i} {...getLineProps({ line })}>
                   {line.map((token, key) => (
                     <span key={key} {...getTokenProps({ token })} />
                   ))}
                 </div>
               ))}
             </pre>
           )}
         </Highlight>
       )
     }

     return (
       <code
         className={`${className} ${
           !className ? 'bg-gray-200 dark:bg-gray-800 rounded px-1' : ''
         }`}
         {...props}
       >
         {children}
       </code>
     )
   }
 }

 return (
   <div className={`prose max-w-none ${theme === 'dark' ? 'prose-invert' : ''}`}>
     <ReactMarkdown
       remarkPlugins={[remarkGfm]}
       rehypePlugins={[rehypeRaw, rehypeSanitize]}
       components={components}
     >
       {content}
     </ReactMarkdown>
   </div>
 )
}