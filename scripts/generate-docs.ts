import fs from 'fs'
import path from 'path'

type DocEntry = {
  header?: string
  comments: {
    symbol: string
    docs: string[]
  }[]
}

export function extractDocumentation(filePath: string): string {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')

  const entries: DocEntry[] = []
  let currentEntry: DocEntry = {comments: []}
  let currentSymbol: string | null = null
  let currentDocs: string[] = []
  let inCommentBlock = false
  let isHeader = false

  for (let line of lines) {
    line = line.trim()

    // doc-header

    if (line.startsWith('// doc-header')) {
      if (currentEntry.comments.length > 0) {
        entries.push(currentEntry)
      }
      isHeader = true
      continue
    }

    // JSDoc start or single line

    if (line.startsWith('/**')) {
      if (!line.endsWith('*/')) {
        inCommentBlock = true
      }
      currentDocs = [line]
      continue
    }

    // JSDoc end

    if (inCommentBlock && line.endsWith('*/')) {
      inCommentBlock = false
      currentDocs.push(line)
      continue
    }

    // JSDoc middle lines

    if (inCommentBlock) {
      currentDocs.push(line)
      continue
    }

    // Next line after JSDoc or doc-header

    if (!inCommentBlock && (isHeader || currentDocs.length > 0)) {
      const symbolMatch = line.match(/^(export\s+)?(function|const|let|var|class|interface|type)?\s?(\w+)/)
      if (symbolMatch) {
        currentSymbol = symbolMatch[3]
        if (isHeader) {
          currentEntry = {
            header: currentSymbol,
            comments: [],
          }
          isHeader = false
        } else {
          currentEntry.comments.push({
            symbol: currentSymbol,
            docs: currentDocs,
          })
          currentDocs = []
          currentSymbol = null
        }
      }
    }
  }

  // Last entry

  if (currentEntry.comments.length > 0) {
    entries.push(currentEntry)
  }

  // Markdown

  let markdown = ''
  for (const entry of entries) {
    if (entry.header) {
      markdown += `##### ${entry.header}\n\n`
    }

    markdown += '| Symbol | Description |\n'
    markdown += '|--------|---------------|\n'

    for (const comment of entry.comments) {
      const docs = comment.docs
        .join(' ')
        .replace(/\|/g, '\\|')
        .replaceAll('/**', '')
        .replaceAll('*/', '')
        .replaceAll('*', '')
        .trim()

      markdown += `| ${comment.symbol} | ${docs} |\n`
    }

    markdown += '\n'
  }

  return markdown
}

const markdown = [
  path.join(process.cwd(), 'src', 'createCache.ts'),
  path.join(process.cwd(), 'src', 'utilsAndConstants.ts'),
]
  .map((filePath) => {
    // Use filename as title
    let title = path
      .basename(filePath)
      .split('.')[0]
      .split(/(?=[A-Z])/)
      .join(' ')
      .toLowerCase()

    // Capitalize
    title = title[0].toUpperCase() + title.slice(1)

    const fileMarkdown = extractDocumentation(filePath)

    return `### ${title}\n${fileMarkdown}`
  })
  .join('\n')

fs.writeFileSync('DOCUMENTATION.md', markdown)

console.log('Documentation generated!')
