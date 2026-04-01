// scripts/update-context.js
// Usage :
//   node scripts/update-context.js
//   node scripts/update-context.js --prompt="Prompt 4.1 — Formulaire déclaration"
//   node scripts/update-context.js --note="Ajout champ duplicateKey"
//   node scripts/update-context.js --erreur="Prisma migrate failed"

const fs   = require('fs')
const path = require('path')

// ── Configuration ─────────────────────────────────────────────
const ROOT    = process.cwd()
const CTX     = path.join(ROOT, 'CONTEXT.md')
const IGNORE  = ['node_modules', '.next', '.git', 'dist', 'build', '.turbo', 'tsconfig.tsbuildinfo']
const EXTS    = ['.ts', '.tsx', '.js', '.json', '.prisma', '.md', '.env', '.mjs', '.bat']

// ── Arborescence ──────────────────────────────────────────────
function getFileTree(dir, prefix = '', depth = 0) {
  if (depth > 3) return ''

  let result = ''
  let items

  try { items = fs.readdirSync(dir) }
  catch { return '' }

  // Dossiers d'abord, fichiers ensuite
  const dirs  = items.filter(i => !IGNORE.some(ig => i === ig || i.startsWith('.env')) && isDir(path.join(dir, i)))
  const files = items.filter(i => !IGNORE.some(ig => i === ig) && !isDir(path.join(dir, i)) && EXTS.includes(path.extname(i)))
  const sorted = [...dirs, ...files]

  sorted.forEach((item, idx) => {
    const full      = path.join(dir, item)
    const isLast    = idx === sorted.length - 1
    const connector = isLast ? '└── ' : '├── '
    result += `${prefix}${connector}${item}\n`
    if (isDir(full)) {
      result += getFileTree(full, prefix + (isLast ? '    ' : '│   '), depth + 1)
    }
  })

  return result
}

function isDir(p) {
  try { return fs.statSync(p).isDirectory() }
  catch { return false }
}

// ── Fichiers récents ──────────────────────────────────────────
function getRecentFiles(limit = 10) {
  const files = []

  function scan(d) {
    let items
    try { items = fs.readdirSync(d) }
    catch { return }

    for (const item of items) {
      if (IGNORE.some(ig => item === ig)) continue
      const full = path.join(d, item)
      try {
        const stat = fs.statSync(full)
        if (stat.isDirectory()) {
          scan(full)
        } else if (['.ts', '.tsx', '.js'].includes(path.extname(item))) {
          files.push({ rel: full.replace(ROOT, '').replace(/\\/g, '/'), mtime: stat.mtimeMs })
        }
      } catch { /* skip */ }
    }
  }

  scan(ROOT)
  return files
    .sort((a, b) => b.mtime - a.mtime)
    .slice(0, limit)
    .map(f => f.rel)
}

// ── Compteurs ─────────────────────────────────────────────────
function countByExt(dir, ext) {
  let n = 0
  function scan(d) {
    let items
    try { items = fs.readdirSync(d) }
    catch { return }
    for (const item of items) {
      if (IGNORE.some(ig => item === ig)) continue
      const full = path.join(d, item)
      try {
        if (fs.statSync(full).isDirectory()) scan(full)
        else if (item.endsWith(ext)) n++
      } catch { /* skip */ }
    }
  }
  scan(dir)
  return n
}

// ── Mise à jour CONTEXT.md ────────────────────────────────────
function updateContext(opts = {}) {
  if (!fs.existsSync(CTX)) {
    console.error('❌  CONTEXT.md introuvable à la racine du projet.')
    process.exit(1)
  }

  const {
    promptEnCours    = 'Non spécifié',
    fichiersModifies = [],
    erreurs          = [],
    notes            = [],
  } = opts

  const now = new Date().toLocaleString('fr-BE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  let content = fs.readFileSync(CTX, 'utf8')

  // DATE
  content = content.replace(/DATE: .*/, `DATE: ${now}`)

  // PROMPT_EN_COURS
  content = content.replace(/PROMPT_EN_COURS: .*/, `PROMPT_EN_COURS: ${promptEnCours}`)

  // FICHIERS_MODIFIES
  const modStr = fichiersModifies.length
    ? fichiersModifies.join(', ')
    : getRecentFiles(5).join(', ')
  content = content.replace(/FICHIERS_MODIFIES: .*/, `FICHIERS_MODIFIES: ${modStr}`)

  // Section fichiers — entre "📁 Fichiers" et "🗄 Schéma"
  const tsxCount = countByExt(path.join(ROOT, 'app'),  '.tsx')
  const tsCount  = countByExt(path.join(ROOT, 'lib'),  '.ts')
  const tree     = getFileTree(ROOT)
  const recent   = getRecentFiles(10).map(f => `  - ${f}`).join('\n')

  const newFilesSection = `## 📁 Fichiers créés jusqu'ici
Dernière mise à jour: ${now}
Fichiers .tsx dans app/: ${tsxCount}
Fichiers .ts dans lib/: ${tsCount}
Fichiers récemment modifiés:
${recent}

Structure du projet:
\`\`\`
${tree}\`\`\``

  content = content.replace(
    /## 📁 Fichiers créés jusqu'ici[\s\S]*?(?=\n## 🗄)/,
    newFilesSection
  )

  // Erreurs
  if (erreurs.length) {
    const newErr = `## 🚨 Dernières erreurs connues\n${erreurs.map(e => `- ${e}`).join('\n')}`
    content = content.replace(
      /## 🚨 Dernières erreurs connues[\s\S]*?(?=\n## 📝|$)/,
      newErr + '\n'
    )
  } else {
    // Remettre "Aucune" si section vide
    content = content.replace(
      /## 🚨 Dernières erreurs connues\n(?!Aucune)[\s\S]*?(?=\n## 📝|$)/,
      `## 🚨 Dernières erreurs connues\nAucune pour le moment.\n`
    )
  }

  // Notes
  if (notes.length) {
    const notesStr = notes.map(n => `- [${now}] ${n}`).join('\n')
    content = content.replace(
      /(## 📝 Notes importantes\n)/,
      `$1${notesStr}\n`
    )
  }

  fs.writeFileSync(CTX, content, 'utf8')
  console.log(`✅  CONTEXT.md mis à jour — ${now}`)
  if (promptEnCours !== 'Non spécifié') console.log(`   Prompt : ${promptEnCours}`)
  console.log(`   ${tsxCount} pages .tsx · ${tsCount} modules .ts`)
}

// ── CLI ───────────────────────────────────────────────────────
module.exports = { updateContext }

if (require.main === module) {
  const opts = {}
  const argv = process.argv.slice(2)

  for (const arg of argv) {
    if (arg.startsWith('--prompt='))  opts.promptEnCours    = arg.slice(9)
    if (arg.startsWith('--note='))    opts.notes            = [arg.slice(7)]
    if (arg.startsWith('--erreur='))  opts.erreurs          = [arg.slice(9)]
    if (arg.startsWith('--fichiers='))opts.fichiersModifies = arg.slice(11).split(',')
  }

  updateContext(opts)
}
