import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { LedgerRecord } from '../context/RecordsContext';
import { Filesystem, Directory } from '@capacitor/filesystem';
// Export records to Excel
export const exportToExcel = (records: LedgerRecord[], fileName: string = 'ssp_records') => {
  const worksheet = XLSX.utils.json_to_sheet(records.map(record => ({
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
    Remarks: record.remarks
  })));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'SSP Records');
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

// --------------------------------------------------------
// Export records to PDF
export const exportToPDF = async (records: LedgerRecord[], fileName: string = 'ssp_records', sspFilter?: string) => {
  // Create landscape PDF
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });
  // Set initial position
  let y = 20;
  // Add title
  doc.setFontSize(18);
  doc.text('SSP Ledger Records', 14, y);
  // Add date
  doc.setFontSize(11);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, y + 8);
  // If we're filtering by a specific SSP, add their info at the top
  if (sspFilter && records.length > 0) {
    const sspRecord = records.find(record => record.sspName === sspFilter);
    if (sspRecord) {
      y += 20;
      doc.setFillColor(230, 230, 230);
      doc.rect(14, y, 270, 20, 'F');
      doc.setFontSize(14);
      doc.text('SSP Information', 14, y + 7);
      doc.setFontSize(11);
      doc.text(`Name: ${sspRecord.sspName}`, 14, y + 15);
      doc.text(`ID: ${sspRecord.sspId}`, 120, y + 15);
      y += 25;
    }
  }
  // Define column headers for complete data
  const headers = ['S/N', 'SSP Name', 'Farmer', 'Phone', 'Date', 'Crops', 'Product', 'Loads', 'Area (Ha)', 'Cost (₦)', 'PPE'];
  // Set font size for table
  doc.setFontSize(9);
  // Define column widths (total width ~270mm for landscape A4)
  const colWidths = [10, 30, 30, 25, 20, 30, 30, 15, 20, 25, 15];
  // Draw header row with background
  doc.setFillColor(41, 128, 185);
  doc.setTextColor(255, 255, 255);
  doc.rect(14, y, colWidths.reduce((a, b) => a + b, 0), 8, 'F');
  // Add header texts
  let x = 14;
  headers.forEach((header, i) => {
    doc.text(header, x + 2, y + 5.5);
    x += colWidths[i];
  });
  // Reset for data rows
  y += 8;
  doc.setTextColor(0, 0, 0);
  // Add data rows
  records.forEach((record, index) => {
    // Add alternating row background for readability
    if (index % 2 === 0) {
      doc.setFillColor(240, 240, 240);
      doc.rect(14, y, colWidths.reduce((a, b) => a + b, 0), 8, 'F');
    }
    x = 14;
    // Add row data
    const rowData = [record.serialNumber.toString(), record.sspName, record.farmerName, record.farmerPhone, new Date(record.serviceDate).toLocaleDateString(), record.cropsTreated, record.productUsed, record.sprayerLoads.toString(), record.areaTreated.toString(), record.serviceCost.toLocaleString(), record.ppeUsed ? 'Yes' : 'No'];
    rowData.forEach((cell, i) => {
      // Truncate text if too long for the column
      let text = cell;
      if (text.length > colWidths[i] * 0.8) {
        text = text.substring(0, Math.floor(colWidths[i] * 0.8)) + '...';
      }
      doc.text(text, x + 2, y + 5.5);
      x += colWidths[i];
    });
    y += 8;
    // Add a new page if we're running out of space
    if (y > 190) {
      // A4 landscape height is about 210mm, leave margin
      doc.addPage();
      y = 20;
      // Redraw header on new page
      doc.setFillColor(41, 128, 185);
      doc.setTextColor(255, 255, 255);
      doc.rect(14, y, colWidths.reduce((a, b) => a + b, 0), 8, 'F');
      x = 14;
      headers.forEach((header, i) => {
        doc.text(header, x + 2, y + 5.5);
        x += colWidths[i];
      });
      y += 8;
      doc.setTextColor(0, 0, 0);
    }
  });
  // Add challenges and remarks section if records exist
  if (records.length > 0) {
    // Add a new page for detailed comments
    doc.addPage();
    y = 20;
    doc.setFontSize(14);
    doc.text('Additional Information', 14, y);
    y += 10;
    doc.setFontSize(10);
    records.forEach((record, ) => {
      if (record.challenges || record.remarks) {
        doc.setFillColor(245, 245, 245);
        doc.rect(14, y, 270, 25, 'F');
        doc.setFontSize(11);
        doc.text(`Record #${record.serialNumber} - ${record.farmerName}`, 16, y + 5);
        doc.setFontSize(10);
        if (record.challenges) {
          doc.text(`Challenges: ${record.challenges}`, 16, y + 12);
        }
        if (record.remarks) {
          doc.text(`Remarks: ${record.remarks}`, 16, y + 19);
        }
        y += 30;
        // Add a new page if needed
        if (y > 180) {
          doc.addPage();
          y = 20;
        }
      }
    });
  }
  // Save PDF
  // After generating the PDF as a Blob or base64:
const pdfBase64 = doc.output('datauristring').split(',')[1];
await Filesystem.writeFile({
  path: `${fileName}.pdf`,
  data: pdfBase64,
  directory: Directory.Documents
});
};