import React from 'react'
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Testing3 = () => {

    const doc = new jsPDF();

    // Define header and footer
    const header = () => {
        doc.setFontSize(10);
        doc.text('Your Header', 10, 10);
    };

    const footer = () => {
        doc.setFontSize(10);
        doc.text('Page ' + doc.internal.getNumberOfPages(), 10, doc.internal.pageSize.height - 10);
    };

    // Function to add content
    const addPageContent = (pageNumber) => {

        header();
        autoTable(doc, { html: '#your-table-id' }); // Example content
        footer();
        doc.addPage();
    };

    // Create multiple pages with content
    for (let i = 0; i < 3; i++) { // Number of pages
        addPageContent(i + 1);
    }

    // Save the PDF
    doc.save('document.pdf');

    return (
        <div>
            <button onClick={generatePDF}>Generate PDF</button>
        </div>
    )
}

export default Testing3
