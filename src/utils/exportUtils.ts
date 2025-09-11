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
  // Create landscape A3 PDF (larger size for all columns)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a3',
  })
  // Set initial position
  let y = 20
  // Add title
  doc.setFontSize(18)
  doc.text('SSP Ledger Records', 14, y)
  // Add date
  doc.setFontSize(11)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, y + 8)
  // If we're filtering by a specific SSP, add their info at the top
  if (sspFilter && records.length > 0) {
    const sspRecord = records.find((record) => record.sspName === sspFilter)
    if (sspRecord) {
      y += 20
      doc.setFillColor(230, 230, 230)
      doc.rect(14, y, 390, 20, 'F') // Wider for A3
      doc.setFontSize(14)
      doc.text('SSP Information', 14, y + 7)
      doc.setFontSize(11)
      doc.text(`Name: ${sspRecord.sspName}`, 14, y + 15)
      doc.text(`ID: ${sspRecord.sspId}`, 120, y + 15)
      y += 25
    }
  }
  // Define column headers including challenges and remarks
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
  // Set font size for table
  doc.setFontSize(10) // Slightly larger font for A3
  // Define column widths (total width ~390mm for landscape A3)
  const colWidths = [10, 30, 30, 25, 20, 25, 25, 15, 20, 20, 15, 75, 80]
  // Draw header row with background
  doc.setFillColor(41, 128, 185)
  doc.setTextColor(255, 255, 255)
  doc.rect(
    14,
    y,
    colWidths.reduce((a, b) => a + b, 0),
    8,
    'F',
  )
  // Add header texts
  let x = 14
  headers.forEach((header, i) => {
    doc.text(header, x + 2, y + 5.5)
    x += colWidths[i]
  })
  // Reset for data rows
  y += 8
  doc.setTextColor(0, 0, 0)
  // Add data rows with all information in one row
  records.forEach((record, index) => {
    // Add alternating row background for readability
    if (index % 2 === 0) {
      doc.setFillColor(240, 240, 240)
      doc.rect(
        14,
        y,
        colWidths.reduce((a, b) => a + b, 0),
        10, // Slightly taller rows to accommodate more text
        'F',
      )
    }
    x = 14
    // Add row data including challenges and remarks
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
    rowData.forEach((cell, i) => {
      // Truncate text if too long for the column
      let text = cell
      const maxChars = Math.floor(colWidths[i] * 0.8)
      // Special handling for longer text fields (challenges and remarks)
      if (i >= 11 && text.length > maxChars) {
        // Challenges and remarks columns
        // For longer text fields, we'll fit as much as possible
        text = text.substring(0, maxChars - 3) + '...'
      } else if (text.length > maxChars) {
        text = text.substring(0, maxChars - 3) + '...'
      }
      doc.text(text, x + 2, y + 5.5)
      x += colWidths[i]
    })
    y += 10 // Slightly taller rows
    // Add a new page if we're running out of space
    if (y > 280) {
      // A3 landscape height is about 297mm, leave margin
      doc.addPage()
      y = 20
      // Redraw header on new page
      doc.setFillColor(41, 128, 185)
      doc.setTextColor(255, 255, 255)
      doc.rect(
        14,
        y,
        colWidths.reduce((a, b) => a + b, 0),
        8,
        'F',
      )
      x = 14
      headers.forEach((header, i) => {
        doc.text(header, x + 2, y + 5.5)
        x += colWidths[i]
      })
      y += 8
      doc.setTextColor(0, 0, 0)
    }
  })
  // Save PDF
  doc.save(`${fileName}.pdf`)
}
