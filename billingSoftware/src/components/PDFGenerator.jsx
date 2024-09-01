import React from 'react'
import { PDFDocument, rgb } from 'pdf-lib';
import { saveAs } from 'file-saver';

const PDFGenerator = () => {
    const createPDF = async () => {
        // Create a new PDF document
        const pdfDoc = await PDFDocument.create();

        // Add a page to the document
        const page = pdfDoc.addPage([600, 400]);
        const { width, height } = page.getSize();

        // Draw text
        page.drawText('Hello, World!', {
            x: 50,
            y: height - 200,
            size: 30,
            color: rgb(0, 0.53, 0.71),
        });

        // Save the document
        const pdfBytes = await pdfDoc.save();

        // Trigger download
        saveAs(new Blob([pdfBytes]), 'example.pdf');
    };

    return (
        <button onClick={createPDF}>Generate PDF</button>
    )
}

export default PDFGenerator
