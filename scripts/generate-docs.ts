const fs = require('fs')
const path = require('path')

type DocEntry = {
  header?: string
  comments: {
    symbol: string
    docs: string[]
  }[]
}

const HEADER = '// doc-header'
const IGNORE = '// doc-ignore'

function extractDocumentation(filePath: string): string {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')

  const entries: DocEntry[] = []
  let currentEntry: DocEntry = {comments: []}
  let currentSymbol: string | undefined
  let currentDocs: string[] = []
  let inCommentBlock = false
  let nextLineIsHeader = false
  let ignoreNextLine = false

  for (let line of lines) {
    line = line.trim()

    if (ignoreNextLine) {
      ignoreNextLine = false
      continue
    }

    // doc-header

    if (line.startsWith(HEADER)) {
      if (currentEntry.comments.length > 0) {
        entries.push(currentEntry)
      }

      const header = line.slice(HEADER.length).trim()
      if (header) {
        currentEntry = {
          header,
          comments: [],
        }
      } else {
        nextLineIsHeader = true
      }
      continue
    }

    if (line.startsWith(IGNORE)) {
      ignoreNextLine = true
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

    if (!inCommentBlock && (nextLineIsHeader || currentDocs.length > 0)) {
      const symbolMatch = line.match(/^(export\s+)?(function|const|let|var|class|interface|type)?\s?(\w+)/)
      if (symbolMatch) {
        currentSymbol = symbolMatch[3]
        if (nextLineIsHeader) {
          currentEntry = {
            header: currentSymbol,
            comments: [],
          }
          nextLineIsHeader = false
        } else {
          currentEntry.comments.push({
            symbol: currentSymbol!,
            docs: currentDocs,
          })
          currentDocs = []
          currentSymbol = undefined
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

const basePath = path.join(process.cwd(), 'src')
const markdown = [
  ['createCache.ts'],
  ['utilsAndConstants.ts'],
  ['react', 'createHooks.ts'],
  ['redux.ts'],
  ['zustand.ts'],
]
  .map((pathArray) => {
    // Use {folder - filename} as title
    let title = pathArray
      .map((x) =>
        x
          .split('.')[0] // Remove extension
          .split(/(?=[A-Z])/) // Split by capitalized letters
          .join(' ')
          .toLowerCase(),
      )
      .join(' – ')

    // Capitalize
    title = title[0].toUpperCase() + title.slice(1)

    const fileMarkdown = extractDocumentation(path.join(basePath, ...pathArray))

    return `### ${title}\n\n${fileMarkdown}`
  })
  .join('\n')

fs.writeFileSync('DOCUMENTATION.md', markdown)

console.log('Documentation generated!')
