#!/usr/bin/env node

import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import ts from '/Users/judangs/project/personal/orca/claude-code-source-code-analysis/node_modules/typescript/lib/typescript.js'

const sourceWorkspace = '/Users/judangs/project/personal/orca/claude-code-source-code-analysis'
const sourceRoot = path.join(sourceWorkspace, 'src')
const sourceRevision = '2ca5ddabfed5f220812ea11f029eda03b21bc4c1'
const sourceTree = '1b6b4ab07d0d7b795129852183137c28099c5550'

function walk(directory) {
  const files = []
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...walk(absolute))
    else if (/\.tsx?$/.test(entry.name) && !entry.name.endsWith('.d.ts')) files.push(absolute)
  }
  return files.sort()
}

function isFile(candidate) {
  try {
    return fs.statSync(candidate).isFile()
  } catch {
    return false
  }
}

function resolveInternalImport(importer, specifier) {
  let base
  if (specifier.startsWith('.')) base = path.resolve(path.dirname(importer), specifier)
  else if (specifier.startsWith('src/')) base = path.join(sourceWorkspace, specifier)
  else return null

  const extensionless = base.replace(/\.(?:mjs|cjs|js|jsx|ts|tsx)$/, '')
  const candidates = [
    base,
    `${extensionless}.ts`,
    `${extensionless}.tsx`,
    path.join(extensionless, 'index.ts'),
    path.join(extensionless, 'index.tsx'),
  ]
  return candidates.find(isFile)
}

function isTypeOnlyImport(node) {
  if (ts.isImportDeclaration(node)) {
    const clause = node.importClause
    if (!clause) return false
    if (clause.isTypeOnly) return true
    const bindings = clause.namedBindings
    return Boolean(
      !clause.name &&
        bindings &&
        ts.isNamedImports(bindings) &&
        bindings.elements.length > 0 &&
        bindings.elements.every(element => element.isTypeOnly),
    )
  }
  if (ts.isExportDeclaration(node)) return node.isTypeOnly
  return false
}

function collectImports(sourceFile) {
  const records = []
  function visit(node) {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteralLike(node.moduleSpecifier)
    ) {
      records.push({ specifier: node.moduleSpecifier.text, typeOnly: isTypeOnlyImport(node) })
    } else if (
      ts.isCallExpression(node) &&
      node.arguments.length === 1 &&
      ts.isStringLiteralLike(node.arguments[0]) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) && node.expression.text === 'require'))
    ) {
      records.push({ specifier: node.arguments[0].text, typeOnly: false })
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return records
}

function groupOf(file) {
  const parts = path.relative(sourceRoot, file).split(path.sep)
  return parts.length === 1 ? '@root' : parts[0]
}

function increment(map, key, amount = 1) {
  map.set(key, (map.get(key) ?? 0) + amount)
}

function stronglyConnectedComponents(nodes, adjacency) {
  let nextIndex = 0
  const stack = []
  const onStack = new Set()
  const indexes = new Map()
  const lowlinks = new Map()
  const components = []

  function visit(node) {
    indexes.set(node, nextIndex)
    lowlinks.set(node, nextIndex)
    nextIndex += 1
    stack.push(node)
    onStack.add(node)
    for (const next of adjacency.get(node) ?? []) {
      if (!indexes.has(next)) {
        visit(next)
        lowlinks.set(node, Math.min(lowlinks.get(node), lowlinks.get(next)))
      } else if (onStack.has(next)) {
        lowlinks.set(node, Math.min(lowlinks.get(node), indexes.get(next)))
      }
    }
    if (lowlinks.get(node) === indexes.get(node)) {
      const component = []
      while (stack.length) {
        const member = stack.pop()
        onStack.delete(member)
        component.push(member)
        if (member === node) break
      }
      components.push(component.sort())
    }
  }

  for (const node of nodes) if (!indexes.has(node)) visit(node)
  return components.sort((a, b) => b.length - a.length || a[0].localeCompare(b[0]))
}

function cyclicSummary(nodes, adjacency) {
  const components = stronglyConnectedComponents(nodes, adjacency)
  const cyclic = components.filter(component => {
    if (component.length > 1) return true
    const [only] = component
    return adjacency.get(only)?.has(only) ?? false
  })
  return {
    componentCount: cyclic.length,
    fileCount: cyclic.reduce((sum, component) => sum + component.length, 0),
    largestComponentFiles: cyclic[0]?.length ?? 0,
    largestComponentSample: (cyclic[0] ?? []).slice(0, 30).map(file => path.relative(sourceRoot, file)),
  }
}

const files = walk(sourceRoot)
const fileSet = new Set(files)
const groupCounts = new Map()
const allAdjacency = new Map(files.map(file => [file, new Set()]))
const runtimeAdjacency = new Map(files.map(file => [file, new Set()]))
const groupAdjacency = new Map()
const groupOccurrences = new Map()
const uniqueFileEdges = new Set()
const uniqueRuntimeFileEdges = new Set()
const uniqueCrossGroupEdges = new Set()
const unresolved = []
let resolvedOccurrences = 0
let runtimeResolvedOccurrences = 0
let crossGroupOccurrences = 0

for (const file of files) {
  const fromGroup = groupOf(file)
  increment(groupCounts, fromGroup)
  if (!groupAdjacency.has(fromGroup)) groupAdjacency.set(fromGroup, new Set())
  const text = fs.readFileSync(file, 'utf8')
  const parsed = ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  )
  for (const record of collectImports(parsed)) {
    const resolved = resolveInternalImport(file, record.specifier)
    if (resolved === null) continue
    if (!resolved) {
      unresolved.push({ importer: path.relative(sourceWorkspace, file), specifier: record.specifier })
      continue
    }
    resolvedOccurrences += 1
    if (fileSet.has(resolved)) {
      allAdjacency.get(file).add(resolved)
      uniqueFileEdges.add(`${file}->${resolved}`)
    }
    if (!record.typeOnly) {
      runtimeResolvedOccurrences += 1
      if (fileSet.has(resolved)) {
        runtimeAdjacency.get(file).add(resolved)
        uniqueRuntimeFileEdges.add(`${file}->${resolved}`)
      }
    }
    const toGroup = groupOf(resolved)
    if (!groupAdjacency.has(toGroup)) groupAdjacency.set(toGroup, new Set())
    if (fromGroup !== toGroup) {
      crossGroupOccurrences += 1
      groupAdjacency.get(fromGroup).add(toGroup)
      uniqueCrossGroupEdges.add(`${fromGroup}->${toGroup}`)
      increment(groupOccurrences, `${fromGroup}->${toGroup}`)
    }
  }
}

const groups = [...groupCounts.keys()].sort()
const groupComponents = stronglyConnectedComponents(groups, groupAdjacency).filter(component => component.length > 1)
const unresolvedSpecifiers = new Set(unresolved.map(item => item.specifier))
const topGroupEdges = [...groupOccurrences.entries()]
  .map(([edge, occurrences]) => {
    const [from, to] = edge.split('->')
    return { from, to, occurrences }
  })
  .sort((a, b) => b.occurrences - a.occurrences || `${a.from}->${a.to}`.localeCompare(`${b.from}->${b.to}`))
  .slice(0, 40)

const topGroups = [...groupCounts.entries()]
  .map(([group, fileCount]) => ({ group, fileCount }))
  .sort((a, b) => b.fileCount - a.fileCount || a.group.localeCompare(b.group))

const result = {
  kind: 'source-module-topology-analysis/v1',
  analyzer: {
    file: 'module-topology-analyzer.mjs',
    sha256: crypto.createHash('sha256').update(fs.readFileSync(new URL(import.meta.url))).digest('hex'),
    semantics: [
      'TypeScript AST import/export and literal dynamic import/require only',
      'relative and src/ internal specifiers only',
      'file-only resolution; directories never count as resolved modules; non-TypeScript files count as resolved occurrences but not graph nodes',
      'runtime-like graph excludes syntactically type-only imports and exports',
    ],
  },
  source: {
    repository: 'https://github.com/stupidhumans/claude-code-source-code/',
    revision: sourceRevision,
    tree: sourceTree,
  },
  totals: {
    implementationFiles: files.length,
    topLevelGroups: groups.length,
    resolvedImportOccurrences: resolvedOccurrences,
    crossGroupImportOccurrences: crossGroupOccurrences,
    crossGroupOccurrencePercent: Number(((crossGroupOccurrences / resolvedOccurrences) * 100).toFixed(2)),
    uniqueResolvedFileEdges: uniqueFileEdges.size,
    distinctCrossGroupEdges: uniqueCrossGroupEdges.size,
    unresolvedInternalImportOccurrences: unresolved.length,
    unresolvedRawSpecifiers: unresolvedSpecifiers.size,
    runtimeLikeResolvedOccurrences: runtimeResolvedOccurrences,
    uniqueRuntimeLikeFileEdges: uniqueRuntimeFileEdges.size,
  },
  stronglyConnectedComponents: {
    groupGraph: {
      cyclicComponentCount: groupComponents.length,
      groupsInCyclicComponents: groupComponents.reduce((sum, component) => sum + component.length, 0),
      largestComponentGroups: groupComponents[0]?.length ?? 0,
      components: groupComponents,
    },
    typeInclusiveFileGraph: cyclicSummary(files, allAdjacency),
    runtimeLikeFileGraph: cyclicSummary(files, runtimeAdjacency),
  },
  topGroups,
  topCrossGroupEdges: topGroupEdges,
  unresolvedExamples: unresolved.slice(0, 60),
  limitations: [
    'Counts are static lower bounds: nonliteral imports, feature-generated modules, and unpublished modules are not available.',
    'The runtime-like graph is a syntax heuristic, not an executed module graph.',
    'Cycles show coupling structure; they do not by themselves prove a design defect or a safe extraction boundary.',
  ],
  authorityEffect: 'none',
}

const output = `${JSON.stringify(result, null, 2)}\n`
const outputIndex = process.argv.indexOf('--output')
if (outputIndex >= 0) {
  const target = process.argv[outputIndex + 1]
  if (!target) throw new Error('--output requires a path')
  fs.writeFileSync(path.resolve(target), output)
} else {
  process.stdout.write(output)
}
