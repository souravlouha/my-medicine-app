import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ইনভয়েস জেনারেট করার ফাংশন
export const generateInvoicePDF = (
  invoiceNo: string, 
  retailerName: string, 
  items: any[], 
  grandTotal: number,
  isPreview: boolean = false // ✅ নতুন প্যারামিটার: প্রিভিউ নাকি ডাউনলোড
) => {
  const doc = new jsPDF();

  // 1. Header Section
  doc.setFontSize(22);
  doc.setTextColor(41, 128, 185); // Blue Color
  doc.text("INVOICE", 14, 22);
  
  // Company Info (Right Side)
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("MedTrace Distributor", 160, 22, { align: "right" });
  doc.text("123, Pharma Street, Kolkata", 160, 27, { align: "right" });
  doc.text("Phone: +91 9876543210", 160, 32, { align: "right" });

  // Line Separator
  doc.setDrawColor(200);
  doc.line(14, 35, 196, 35);

  // 2. Bill Details
  doc.setFontSize(10);
  doc.setTextColor(0);
  
  doc.text(`Invoice No:`, 14, 45);
  doc.setFont("helvetica", "bold");
  doc.text(`${invoiceNo}`, 35, 45);
  
  doc.setFont("helvetica", "normal");
  doc.text(`Date:`, 14, 50);
  doc.text(`${new Date().toLocaleDateString()}`, 35, 50);

  doc.text(`Bill To:`, 14, 60);
  doc.setFont("helvetica", "bold");
  doc.text(`${retailerName}`, 35, 60);

  // 3. Table Data Preparation
  const tableRows = items.map((item, index) => [
    index + 1,
    item.productName,
    item.batchNo,
    item.quantity,
    `Rs. ${item.unitPrice}`,
    `Rs. ${item.total}`,
  ]);

  // 4. Generate Table
  autoTable(doc, {
    head: [["#", "Product", "Batch", "Qty", "Unit Price", "Total"]],
    body: tableRows,
    startY: 70,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    styles: { fontSize: 9 },
  });

  // 5. Grand Total Calculation
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Grand Total:`, 140, finalY);
  doc.setTextColor(41, 128, 185);
  doc.text(`Rs. ${grandTotal.toFixed(2)}`, 170, finalY);

  // 6. Footer
  doc.setTextColor(150);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Thank you for your business!", 105, 280, { align: "center" });
  doc.text("Authorized Signature", 196, finalY + 30, { align: "right" });

  // ✅ 7. Output Logic (Preview vs Download)
  if (isPreview) {
    // নতুন ট্যাবে খোলার লজিক
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
  } else {
    // ডাউনলোড লজিক
    doc.save(`Invoice_${invoiceNo}.pdf`);
  }
};