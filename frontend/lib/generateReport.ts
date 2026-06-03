import jsPDF from "jspdf"

interface ReportData {
  type: "phytosanitaire" | "pedologique"
  culture?: string
  parcelle?: string
  region?: string
  maladie?: string
  confiance?: number
  gravite?: string
  description?: string
  recommandations?: string[]
  traitement_local?: string
  // Pédologique
  ph?: number
  texture?: string
  humidite?: string
  drainage?: string
  cultures_recommandees?: string[]
  conseil?: string
  imageBase64?: string
  userName?: string
  date?: string
}

// Couleurs AgriGenius
const COLORS = {
  primary:    [26, 107, 60]   as [number, number, number],
  secondary:  [76, 175, 80]   as [number, number, number],
  accent:     [232, 160, 32]  as [number, number, number],
  dark:       [28, 26, 23]    as [number, number, number],
  gray:       [90, 86, 80]    as [number, number, number],
  lightGray:  [247, 245, 240] as [number, number, number],
  white:      [255, 255, 255] as [number, number, number],
  danger:     [192, 57, 43]   as [number, number, number],
}

const GRAVITE_COLORS: Record<string, [number, number, number]> = {
  "très élevée": COLORS.danger,
  "élevée":      COLORS.accent,
  "moyenne":     COLORS.accent,
  "inconnue":    COLORS.gray,
}

export function generateDiagnosticPDF(data: ReportData): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
  const W = 210
  const margin = 16
  let y = 0

  // ─── HEADER ───────────────────────────────────────────────
  // Fond vert header
  doc.setFillColor(...COLORS.primary)
  doc.rect(0, 0, W, 42, "F")

  // Logo carré
  doc.setFillColor(...COLORS.secondary)
  doc.roundedRect(margin, 8, 22, 22, 3, 3, "F")
  doc.setTextColor(...COLORS.white)
  doc.setFontSize(14)
  doc.setFont("helvetica", "bold")
  doc.text("AG", margin + 5.5, 22)

  // Titre app
  doc.setFontSize(20)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...COLORS.white)
  doc.text("AgriGenius", margin + 28, 16)

  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(200, 230, 200)
  doc.text("Plateforme intelligente de digitalisation agricole — Cameroun", margin + 28, 22)

  // Badge type rapport
  const typeLabel = data.type === "phytosanitaire"
    ? "RAPPORT DIAGNOSTIC PHYTOSANITAIRE"
    : "RAPPORT DIAGNOSTIC PEDOLOGIQUE"
  doc.setFillColor(...COLORS.accent)
  doc.roundedRect(margin + 28, 26, 100, 8, 2, 2, "F")
  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...COLORS.white)
  doc.text(typeLabel, margin + 30, 31.5)

  // Date + utilisateur (droite)
  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(200, 230, 200)
  const dateStr = data.date || new Date().toLocaleDateString("fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  })
  doc.text(dateStr, W - margin, 16, { align: "right" })
  if (data.userName) {
    doc.text(`Agriculteur(rice) : ${data.userName}`, W - margin, 22, { align: "right" })
  }
  if (data.region) {
    doc.text(`Région : ${data.region}`, W - margin, 28, { align: "right" })
  }

  y = 50

  // ─── SECTION : INFORMATIONS GÉNÉRALES ─────────────────────
  doc.setFillColor(...COLORS.lightGray)
  doc.roundedRect(margin, y, W - margin * 2, 24, 3, 3, "F")

  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(...COLORS.gray)
  doc.text("INFORMATIONS SUR L'ANALYSE", margin + 6, y + 7)

  doc.setFont("helvetica", "normal")
  doc.setTextColor(...COLORS.dark)
  doc.setFontSize(10)

  const infoItems = []
  if (data.culture)  infoItems.push(["Culture analysée", data.culture])
  if (data.parcelle) infoItems.push(["Parcelle", data.parcelle])
  if (data.ph)       infoItems.push(["pH du sol", String(data.ph)])
  if (data.texture)  infoItems.push(["Texture du sol", data.texture])

  infoItems.forEach(([label, val], i) => {
    const col = i < 2 ? margin + 6 : margin + 95
    const row = i < 2 ? y + 14 + (i * 6) : y + 14 + ((i - 2) * 6)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...COLORS.gray)
    doc.setFontSize(8)
    doc.text(`${label} :`, col, row)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(...COLORS.dark)
    doc.setFontSize(9)
    doc.text(val, col + 30, row)
  })

  y += 32

  // ─── SECTION PHYTOSANITAIRE ────────────────────────────────
  if (data.type === "phytosanitaire") {

    // Bloc résultat principal
    const graviteColor = data.gravite
      ? (GRAVITE_COLORS[data.gravite] || COLORS.gray)
      : COLORS.gray

    doc.setFillColor(graviteColor[0], graviteColor[1], graviteColor[2], )
    doc.setDrawColor(graviteColor[0], graviteColor[1], graviteColor[2])
    doc.setLineWidth(0.5)
    doc.roundedRect(margin, y, W - margin * 2, 28, 3, 3, "D")

    // Fond léger
    doc.setFillColor(graviteColor[0], graviteColor[1], graviteColor[2])
    doc.setGState(new (doc as any).GState({ opacity: 0.08 }))
    doc.roundedRect(margin, y, W - margin * 2, 28, 3, 3, "F")
    doc.setGState(new (doc as any).GState({ opacity: 1 }))

    // Badge gravité
    doc.setFillColor(graviteColor[0], graviteColor[1], graviteColor[2])
    doc.roundedRect(margin + 4, y + 4, 28, 6, 1.5, 1.5, "F")
    doc.setFontSize(7)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...COLORS.white)
    const graviteLabel = data.gravite === "très élevée" ? "CRITIQUE"
      : data.gravite === "élevée" ? "ELEVEE"
      : data.gravite === "moyenne" ? "MODEREE" : "INCONNUE"
    doc.text(`GRAVITE : ${graviteLabel}`, margin + 6, y + 8.5)

    // Nom maladie
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...COLORS.dark)
    doc.text(data.maladie || "Maladie détectée", margin + 6, y + 18)

    // Description
    if (data.description) {
      doc.setFontSize(8)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(...COLORS.gray)
      const descLines = doc.splitTextToSize(data.description, W - margin * 2 - 12)
      doc.text(descLines[0], margin + 6, y + 24)
    }

    // Score confiance (droite)
    if (data.confiance !== undefined) {
      doc.setFontSize(22)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(graviteColor[0], graviteColor[1], graviteColor[2])
      doc.text(`${data.confiance}%`, W - margin - 6, y + 18, { align: "right" })
      doc.setFontSize(7)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(...COLORS.gray)
      doc.text("CONFIANCE IA", W - margin - 6, y + 24, { align: "right" })
    }

    y += 35

    // Image si disponible
    if (data.imageBase64) {
      try {
        doc.addImage(data.imageBase64, "JPEG", margin, y, 45, 40)
        y += 48
      } catch { y += 4 }
    }

    // Recommandations
    if (data.recommandations && data.recommandations.length > 0) {
      // Titre section
      doc.setFillColor(...COLORS.primary)
      doc.rect(margin, y, 4, 18, "F")
      doc.setFontSize(11)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(...COLORS.primary)
      doc.text("Recommandations de traitement", margin + 8, y + 7)
      doc.setFontSize(8)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(...COLORS.gray)
      doc.text(`${data.recommandations.length} actions préconisées`, margin + 8, y + 13)
      y += 22

      data.recommandations.forEach((rec: any, i) => {
        const action = typeof rec === "string" ? rec : rec.action
        const explication = typeof rec === "object" ? rec.explication : null

        const bgColor: [number, number, number] = i % 2 === 0 ? [240, 250, 244] : [255, 255, 255]
        const actionLines = doc.splitTextToSize(action, W - margin * 2 - 22)
        const expLines = explication ? doc.splitTextToSize(`💡 ${explication}`, W - margin * 2 - 22) : []
        const blockH = actionLines.length * 5 + (expLines.length > 0 ? expLines.length * 4.5 + 6 : 0) + 10

        doc.setFillColor(...bgColor)
        doc.roundedRect(margin, y, W - margin * 2, blockH, 2, 2, "F")

        // Numéro
        doc.setFillColor(...COLORS.primary)
        doc.circle(margin + 6, y + 8, 4, "F")
        doc.setFontSize(8)
        doc.setFont("helvetica", "bold")
        doc.setTextColor(...COLORS.white)
        doc.text(String(i + 1), margin + 6, y + 9, { align: "center" })

        // Action
        doc.setFontSize(9)
        doc.setFont("helvetica", "bold")
        doc.setTextColor(...COLORS.dark)
        doc.text(actionLines, margin + 14, y + 6)

        // Explication
        if (expLines.length > 0) {
          doc.setFontSize(8)
          doc.setFont("helvetica", "italic")
          doc.setTextColor(...COLORS.gray)
          doc.text(expLines, margin + 14, y + 6 + actionLines.length * 5 + 3)
        }

        y += blockH + 3

        if (y > 265) {
          doc.addPage()
          y = 20
        }
      })
    }

    y += 4

    // Traitement local
    if (data.traitement_local) {
      doc.setFillColor(255, 251, 240)
      doc.setDrawColor(...COLORS.accent)
      doc.setLineWidth(0.5)
      doc.roundedRect(margin, y, W - margin * 2, 20, 3, 3, "FD")

      doc.setFillColor(...COLORS.accent)
      doc.roundedRect(margin + 4, y + 4, 32, 6, 1.5, 1.5, "F")
      doc.setFontSize(7)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(...COLORS.white)
      doc.text("TRAITEMENT LOCAL", margin + 6, y + 8.5)

      const tlLines = doc.splitTextToSize(data.traitement_local, W - margin * 2 - 12)
      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(...COLORS.dark)
      doc.text(tlLines, margin + 6, y + 15)
      y += 26
    }
  }

  // ─── SECTION PÉDOLOGIQUE ──────────────────────────────────
  if (data.type === "pedologique") {
    // Paramètres sol
    doc.setFillColor(...COLORS.lightGray)
    doc.roundedRect(margin, y, W - margin * 2, 28, 3, 3, "F")
    doc.setFontSize(9)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...COLORS.gray)
    doc.text("PARAMÈTRES DU SOL ANALYSÉ", margin + 6, y + 7)
    y += 10

    const solParams = [
      ["pH", String(data.ph || "-")],
      ["Texture", data.texture || "-"],
      ["Humidité", data.humidite || "-"],
      ["Drainage", data.drainage || "-"],
    ]
    solParams.forEach(([label, val], i) => {
      const col = i < 2 ? margin + 6 : margin + 100
      const row = i % 2 === 0 ? y + 4 : y + 11
      doc.setFont("helvetica", "bold")
      doc.setFontSize(8)
      doc.setTextColor(...COLORS.gray)
      doc.text(`${label} :`, col, row)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)
      doc.setTextColor(...COLORS.dark)
      doc.text(val, col + 20, row)
    })
    y += 28

    // Cultures recommandées
    if (data.cultures_recommandees && data.cultures_recommandees.length > 0) {
      doc.setFillColor(...COLORS.primary)
      doc.rect(margin, y, 4, 14, "F")
      doc.setFontSize(11)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(...COLORS.primary)
      doc.text("Cultures recommandées", margin + 8, y + 9)
      y += 18

      const cols = 3
      const cellW = (W - margin * 2 - (cols - 1) * 6) / cols
      data.cultures_recommandees.forEach((culture, i) => {
        const col = i % cols
        const row = Math.floor(i / cols)
        const x = margin + col * (cellW + 6)
        const cy = y + row * 14

        doc.setFillColor(240, 250, 244)
        doc.setDrawColor(...COLORS.secondary)
        doc.setLineWidth(0.5)
        doc.roundedRect(x, cy, cellW, 10, 2, 2, "FD")
        doc.setFontSize(9)
        doc.setFont("helvetica", "bold")
        doc.setTextColor(...COLORS.primary)
        doc.text(culture, x + cellW / 2, cy + 6.5, { align: "center" })
      })
      y += Math.ceil(data.cultures_recommandees.length / cols) * 14 + 6
    }

    // Conseil
    if (data.conseil) {
      doc.setFillColor(240, 250, 244)
      doc.setDrawColor(...COLORS.primary)
      doc.setLineWidth(0.5)
      doc.roundedRect(margin, y, W - margin * 2, 18, 3, 3, "FD")
      doc.setFontSize(8)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(...COLORS.primary)
      doc.text("Conseil agronomique :", margin + 6, y + 7)
      const conseilLines = doc.splitTextToSize(data.conseil, W - margin * 2 - 12)
      doc.setFont("helvetica", "normal")
      doc.setTextColor(...COLORS.dark)
      doc.text(conseilLines, margin + 6, y + 13)
      y += 24
    }
  }

  // ─── FOOTER ────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages()
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p)
    const footY = 290

    doc.setFillColor(...COLORS.primary)
    doc.rect(0, footY - 2, W, 12, "F")

    doc.setFontSize(7)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(200, 230, 200)
    doc.text(
      "AgriGenius — Plateforme intelligente de digitalisation agricole au Cameroun | UIECC Sangmélima",
      W / 2, footY + 3, { align: "center" }
    )
    doc.text(
      "Ce rapport est fourni à titre indicatif. Pour les cas critiques, consultez l'IRAD ou le MINADER.",
      W / 2, footY + 7, { align: "center" }
    )

    doc.setTextColor(...COLORS.accent)
    doc.text(`Page ${p} / ${pageCount}`, W - margin, footY + 3, { align: "right" })
  }

  // ─── TÉLÉCHARGEMENT ────────────────────────────────────────
  const date = new Date().toISOString().slice(0, 10)
  const typeName = data.type === "phytosanitaire" ? "Phyto" : "Pedologie"
  const cultureName = (data.culture || "").replace(/\s+/g, "-")
  doc.save(`AgriGenius_Diagnostic_${typeName}_${cultureName}_${date}.pdf`)
}
