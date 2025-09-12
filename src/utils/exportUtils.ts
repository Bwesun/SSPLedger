import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import { LedgerRecord } from '../context/RecordsContext'
// Export records to Excel
export const exportToExcel = (
  records: LedgerRecord[],
  fileName: string = 'ssp_records',
) => {
  const worksheet = XLSX.utils.json_to_sheet(
    records.map((record) => ({
      'Serial Number': record.serialNumber,
      'SSP Name': record.sspName,
      'Farmer Name': record.farmerName,
      'Farmer Phone': record.farmerPhone,
      'Service Date': new Date(record.serviceDate).toLocaleDateString(),
      'Crops Treated': record.cropsTreated,
      'Product Used': record.productUsed,
      'Sprayer Loads': record.sprayerLoads,
      'Service Cost (₦)': record.serviceCost,
      'Area Treated (Ha)': record.areaTreated,
      'PPE Used': record.ppeUsed ? 'Yes' : 'No',
      Challenges: record.challenges,
      Remarks: record.remarks,
    })),
  )
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'SSP Records')
  XLSX.writeFile(workbook, `${fileName}.xlsx`)
}
// Export records to PDF
export const exportToPDF = (
  records: LedgerRecord[],
  fileName: string = 'ssp_records',
  sspFilter?: string,
) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a3',
  })
  let y = 20
  doc.setFontSize(18)
  doc.text('SSP Ledger Records', 14, y)
  doc.setFontSize(11)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, y + 8)
  if (sspFilter && records.length > 0) {
    const sspRecord = records.find((record) => record.sspName === sspFilter)
    if (sspRecord) {
      y += 20
      doc.setFillColor(230, 230, 230)
      doc.rect(14, y, 390, 20, 'F')
      doc.setFontSize(14)
      doc.text('SSP Information', 14, y + 7)
      doc.setFontSize(11)
      doc.text(`Name: ${sspRecord.sspName}`, 14, y + 15)
      doc.text(`ID: ${sspRecord.sspId}`, 120, y + 15)
      y += 25
    }
  }
  const headers = [
    'S/N',
    'SSP Name',
    'Farmer',
    'Phone',
    'Date',
    'Crops',
    'Product',
    'Loads',
    'Area (Ha)',
    'Cost (₦)',
    'PPE',
    'Challenges',
    'Remarks',
  ]
  doc.setFontSize(10)
  const colWidths = [10, 30, 30, 25, 20, 25, 25, 15, 20, 20, 15, 75, 80]
  // Draw header row
  doc.setFillColor(41, 128, 185)
  doc.setTextColor(255, 255, 255)
  doc.rect(14, y, colWidths.reduce((a, b) => a + b, 0), 8, 'F')
  let x = 14
  headers.forEach((header, i) => {
    doc.text(header, x + 2, y + 5.5)
    x += colWidths[i]
  })
  y += 8
  doc.setTextColor(0, 0, 0)

  records.forEach((record, index) => {
    // Prepare row data
    const rowData = [
      record.serialNumber.toString(),
      record.sspName,
      record.farmerName,
      record.farmerPhone,
      new Date(record.serviceDate).toLocaleDateString(),
      record.cropsTreated,
      record.productUsed,
      record.sprayerLoads.toString(),
      record.areaTreated.toString(),
      record.serviceCost.toLocaleString(),
      record.ppeUsed ? 'Yes' : 'No',
      record.challenges || 'None',
      record.remarks || 'None',
    ]
    // Wrap each cell's text
    const wrappedCells = rowData.map((cell, i) =>
      doc.splitTextToSize(cell, colWidths[i] - 4),
    )
    // Find max number of lines in this row
    const maxLines = Math.max(...wrappedCells.map((lines) => lines.length))
    const rowHeight = 5.5 * maxLines + 3 // 5.5mm per line + padding

    // Alternating row background
    if (index % 2 === 0) {
      doc.setFillColor(240, 240, 240)
      doc.rect(14, y, colWidths.reduce((a, b) => a + b, 0), rowHeight, 'F')
    }

    // Draw each cell (with wrapping)
    x = 14
    wrappedCells.forEach((lines, i) => {
      lines.forEach((line: string, lineIdx:any) => {
        doc.text(line, x + 2, y + 5.5 + lineIdx * 5.5)
      })
      x += colWidths[i]
    })

    y += rowHeight

    // Add a new page if we're running out of space
    if (y > 280) {
      doc.addPage()
      y = 20
      // Redraw header
      doc.setFillColor(41, 128, 185)
      doc.setTextColor(255, 255, 255)
      doc.rect(14, y, colWidths.reduce((a, b) => a + b, 0), 8, 'F')
      x = 14
      headers.forEach((header, i) => {
        doc.text(header, x + 2, y + 5.5)
        x += colWidths[i]
      })
      y += 8
      doc.setTextColor(0, 0, 0)
    }
  })
  doc.save(`${fileName}.pdf`)
}
