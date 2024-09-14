'use client'

import { FC, memo } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import {
  coldarkDark,
  coldarkCold
} from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { nanoid } from 'lib/utils'
import { useTheme } from 'next-themes'

import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard'
import { IconCheck, IconCopy, IconDownload } from '@/components/ui/icons'
import { Button } from '@/components/ui/button'

interface Props {
  filename?: string
  language?: string
  code: string
  highlight?: number[]
}

interface languageMap {
  [key: string]: string | undefined
}

export const programmingLanguages: languageMap = {
  javascript: '.js',
  python: '.py',
  java: '.java',
  c: '.c',
  cpp: '.cpp',
  'c++': '.cpp',
  'c#': '.cs',
  ruby: '.rb',
  php: '.php',
  swift: '.swift',
  'objective-c': '.m',
  kotlin: '.kt',
  typescript: '.ts',
  jsx: '.jsx',
  tsx: '.tsx',
  go: '.go',
  perl: '.pl',
  rust: '.rs',
  scala: '.scala',
  haskell: '.hs',
  lua: '.lua',
  shell: '.sh',
  sql: '.sql',
  html: '.html',
  css: '.css'
}

const CodeBlock: FC<Props> = memo(({ filename, language, code, highlight }) => {
  const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 })
  const { theme } = useTheme()

  const downloadAsFile = () => {
    if (typeof window === 'undefined') {
      return
    }
    const fileExtension = programmingLanguages[language!] || '.file'
    const suggestedFileName = `file-${nanoid()}${fileExtension}`
    const fileName = window.prompt('Save as', suggestedFileName)

    if (!fileName) return

    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = fileName
    link.href = url
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const onCopy = () => {
    if (isCopied) return
    copyToClipboard(code)
  }

  return (
    <div className="relative w-full font-sans border border-accent rounded-lg card-shadow">
      {language ? (
        <div className="flex items-center justify-between w-full p-2 bg-card text-card-foreground border-accent border-b rounded-t-lg">
          <h6 className="ml-2 text-md font-light lowercase">
            {filename}.{language}
          </h6>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" onClick={downloadAsFile} size="icon">
              <IconDownload />
              <span className="sr-only">Download</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={onCopy}>
              {isCopied ? <IconCheck /> : <IconCopy />}
              <span className="sr-only">Copy code</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="absolute top-2 right-2">
          <Button variant="ghost" size="icon" onClick={onCopy}>
            {isCopied ? <IconCheck /> : <IconCopy />}
            <span className="sr-only">Copy code</span>
          </Button>
        </div>
      )}
      <SyntaxHighlighter
        language={language}
        style={theme === 'dark' ? coldarkDark : coldarkCold}
        PreTag="div"
        showLineNumbers={language ? true : false}
        wrapLines
        lineProps={line => {
          let style: any = { display: 'block' }
          if (highlight?.includes(line)) {
            style.backgroundColor = theme === 'dark' ? '#0F2F57' : '#E0F0FF'
            style.width = '100%'
            style.borderLeft = '3px solid #52A8FF'
          }
          return { style }
        }}
        customStyle={{
          width: '100%',
          margin: 0,
          backgroundColor: theme === 'dark' ? 'black' : 'none',
          padding: '1rem 0'
        }}
        lineNumberStyle={{
          paddingLeft: '1.5rem',
          userSelect: 'none'
        }}
        codeTagProps={{
          style: {
            fontSize: '0.9rem',
            fontFamily: 'var(--font-mono)'
          }
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
})
CodeBlock.displayName = 'CodeBlock'

export { CodeBlock }
