import dynamic from "next/dynamic"

export const MarkdownEditor = dynamic(() => import("./_MarkdownEditor"), { ssr: false })

export const markdownClassNames = "max-w-none prose prose-neutral dark:prose-invert font-sans"