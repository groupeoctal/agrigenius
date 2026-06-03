import jsPDF from "jspdf"

interface CertificatData {
  userName: string
  coursTitre: string
  coursFiliere: string
  score: number
  date: string
}

export function generateCertificatPDF(data: CertificatData): void {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })
  const W = 297
  const H = 210

  // ─── FOND ─────────────────────────────────────────────────────────────────
  // Fond crème
  doc.setFillColor(252, 250, 245)
  doc.rect(0, 0, W, H, "F")

  // Bordure décorative externe
  doc.setDrawColor(26, 107, 60)
  doc.setLineWidth(3)
  doc.rect(8, 8, W - 16, H - 16, "D")

  // Bordure interne fine
  doc.setDrawColor(232, 160, 32)
  doc.setLineWidth(0.8)
  doc.rect(12, 12, W - 24, H - 24, "D")

  // Coins décoratifs
  const corner = (x: number, y: number, sx: number, sy: number) => {
    doc.setFillColor(26, 107, 60)
    doc.rect(x, y, 12 * sx, 2, "F")
    doc.rect(x, y, 2, 12 * sy, "F")
  }
  corner(14, 14, 1, 1)
  corner(W - 26, 14, -1, 1)
  corner(14, H - 16, 1, -1)
  corner(W - 26, H - 16, -1, -1)

  // ─── LOGO ─────────────────────────────────────────────────────────────────
  doc.setFillColor(26, 107, 60)
  doc.roundedRect(W / 2 - 14, 18, 28, 28, 5, 5, "F")
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(255, 255, 255)
  doc.text("AG", W / 2, 35, { align: "center" })

  // Nom app
  doc.setFontSize(13)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(26, 107, 60)
  doc.text("AgriGenius", W / 2, 52, { align: "center" })

  doc.setFontSize(8)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(154, 149, 144)
  doc.text("Plateforme intelligente de digitalisation agricole — Cameroun", W / 2, 58, { align: "center" })

  // ─── TITRE CERTIFICAT ────────────────────────────────────────────────────
  doc.setFontSize(9)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(154, 149, 144)
  const titre = "CERTIFICAT DE FORMATION"
  // Ligne décorative avant et après le titre
  const titreW = doc.getTextWidth(titre)
  doc.setDrawColor(232, 160, 32)
  doc.setLineWidth(0.5)
  doc.line(W / 2 - titreW / 2 - 20, 68, W / 2 - titreW / 2 - 4, 68)
  doc.line(W / 2 + titreW / 2 + 4, 68, W / 2 + titreW / 2 + 20, 68)
  doc.text(titre, W / 2, 70, { align: "center" })

  // ─── TEXTE PRINCIPAL ─────────────────────────────────────────────────────
  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(90, 86, 80)
  doc.text("Ce certificat est décerné à", W / 2, 82, { align: "center" })

  // Nom du lauréat
  doc.setFontSize(26)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(26, 107, 60)
  doc.text(data.userName, W / 2, 96, { align: "center" })

  // Ligne sous le nom
  const nameW = Math.min(doc.getTextWidth(data.userName), 150)
  doc.setDrawColor(26, 107, 60)
  doc.setLineWidth(0.8)
  doc.line(W / 2 - nameW / 2, 99, W / 2 + nameW / 2, 99)

  // Texte intermédiaire
  doc.setFontSize(11)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(90, 86, 80)
  doc.text("pour avoir complété avec succès le cours", W / 2, 109, { align: "center" })

  // Titre du cours
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(28, 26, 23)
  const coursLines = doc.splitTextToSize(data.coursTitre, 200)
  doc.text(coursLines, W / 2, 120, { align: "center" })

  // Score
  doc.setFillColor(240, 250, 244)
  doc.setDrawColor(26, 107, 60)
  doc.setLineWidth(0.5)
  doc.roundedRect(W / 2 - 35, 132, 70, 18, 4, 4, "FD")
  doc.setFontSize(11)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(26, 107, 60)
  const scoreEmoji = data.score >= 90 ? "🏆" : data.score >= 80 ? "🎓" : "✅"
  doc.text(`Score obtenu : ${data.score}%  ${scoreEmoji}`, W / 2, 143, { align: "center" })

  // ─── FILIÈRE ──────────────────────────────────────────────────────────────
  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(154, 149, 144)
  doc.text(`Filière : ${data.coursFiliere}`, W / 2, 158, { align: "center" })

  // ─── DATE ET SIGNATURES ──────────────────────────────────────────────────
  // Ligne séparatrice
  doc.setDrawColor(226, 221, 214)
  doc.setLineWidth(0.3)
  doc.line(W / 2 - 80, 166, W / 2 + 80, 166)

  doc.setFontSize(9)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(154, 149, 144)
  doc.text(`Délivré le : ${data.date}`, W / 2 - 50, 172, { align: "center" })
  doc.text("UIECC — Sangmélima, Cameroun", W / 2 + 50, 172, { align: "center" })

  // Signatures
  doc.setDrawColor(90, 86, 80)
  doc.setLineWidth(0.4)
  doc.line(W / 2 - 90, 188, W / 2 - 30, 188)
  doc.line(W / 2 + 30, 188, W / 2 + 90, 188)

  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.setTextColor(90, 86, 80)
  doc.text("Responsable Formation", W / 2 - 60, 193, { align: "center" })
  doc.text("Direction AgriGenius", W / 2 + 60, 193, { align: "center" })

  // ─── QR Code placeholder ─────────────────────────────────────────────────
  doc.setFillColor(247, 245, 240)
  doc.setDrawColor(226, 221, 214)
  doc.setLineWidth(0.3)
  doc.roundedRect(W - 50, H - 50, 35, 35, 2, 2, "FD")
  doc.setFontSize(6)
  doc.setTextColor(154, 149, 144)
  doc.text("Vérif.", W - 32.5, H - 18, { align: "center" })
  doc.text("en ligne", W - 32.5, H - 14, { align: "center" })

  // ─── TÉLÉCHARGEMENT ───────────────────────────────────────────────────────
  const filename = `Certificat_AgriGenius_${data.userName.replace(/\s+/g, "_")}_${data.date.replace(/\//g, "-")}.pdf`
  doc.save(filename)
}
