import React, { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const PDFGen2 = () => {
    const [itemName, setItemName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [rate, setRate] = useState('');
    const [items, setItems] = useState([]);

    const handleAddItem = () => {
        const qty = parseFloat(quantity);
        const r = parseFloat(rate);
        if (itemName && !isNaN(qty) && !isNaN(r)) {
            setItems([...items, { itemName, quantity: qty, rate: r, total: qty * r }]);
            setItemName('');
            setQuantity('');
            setRate('');
        }
    };

    // Header details
    const mobile1 = "Mobile : +91 94264 48570"
    const mobile2 = "+91 91730 37132"
    const businessName = "SUBHASH GOSVAMI";
    const businessDetails = "ALL TYPES OF ELECTRICAL & CABLING WORKS"
    const address = "D-63/301, Swaminarayan Park, Haridarshan Char Rasta, New Naroda, Ahmedabad-382330";
    const partyDetails = "Univarsal Software";
    const date = new Date().toLocaleDateString();

    const handleGeneratePDF = () => {
        const doc = new jsPDF();
        const entriesPerPage = 30; // Number of entries per page
        const totalPages = Math.ceil(items.length / entriesPerPage);

        /*
        const tableColumn = ['S.N.', 'Item Name', 'Qty', 'Rate', 'Total'];
        const tableRows = items.map((item, index) => [
            (index + 1).toString(),
            item.itemName,
            item.quantity.toString(),
            item.rate.toFixed(2),
            item.total.toFixed(2)
        ]);
        */

        // Function to add the header on each page
        const addHeader = () => {
            const pageWidth = doc.internal.pageSize.getWidth();

            // Add header details aligned to the right
            const marginRight = 10; // Adjust as needed

            // Add centered business name
            doc.setFontSize(25);
            doc.setFont("helvetica", "bold"); // Set font to bold
            const businessNameWidth = doc.getTextWidth(businessName);
            const businessNameX = (pageWidth - businessNameWidth) / 2;
            doc.text(businessName, businessNameX, 30); // Position the business name

            doc.setFont("helvetica", "normal"); // Set font to bold

            //other business related details at center
            doc.setFontSize(12);
            const businessDetailsWidth = doc.getTextWidth(businessDetails);
            const businessDetailsX = (pageWidth - businessDetailsWidth) / 2;
            doc.text(businessDetails, businessDetailsX, 36);

            doc.setFontSize(12);
            const addressWidth = doc.getTextWidth(address);
            const addressX = (pageWidth - addressWidth) / 2;
            doc.text(address, addressX, 42);

            // Draw a horizontal line
            const lineX = 10; // X coordinate for the line (margin)
            const lineY = 48; // Y coordinate for the line (position below the header)
            const lineWidth = pageWidth - 20; // Line width (full page width minus margins)
            doc.setLineWidth(0.5); // Line thickness
            doc.line(lineX, lineY, lineX + lineWidth, lineY); // Draw the line

            // Add header details
            doc.setFontSize(12);
            doc.text(mobile1, pageWidth - marginRight, 10, { align: 'right' })
            doc.text(mobile2, pageWidth - marginRight, 15, { align: 'right' })
            doc.text(partyDetails, 10, 65);
            doc.text(`Date: ${date}`, 10, 70);

            // Add a title
            doc.setFontSize(16);
            doc.text('Invoice', 10, 80);

        }

        const addTableToPage = (pageIndex, doc) => {
            const start = pageIndex * entriesPerPage;
            const end = Math.min(start + entriesPerPage, items.length);
            const tableColumn = ['S.N.', 'Item Name', 'Qty', 'Rate', 'Total'];

            const tableRows = items.slice(start, end).map((item, index) => [
                (start + index + 1).toString(),
                item.itemName,
                item.quantity.toString(),
                item.rate.toFixed(2),
                item.total.toFixed(2)
            ]);

            doc.autoTable({
                startY: 100,
                head: [tableColumn],
                body: tableRows,
                margin: { horizontal: 10 },
                styles: { fontSize: 10 }
            });
        };

        // Generate each page
        for (let i = 0; i < totalPages; i++) {
            if (i > 0) doc.addPage();
            addHeader();
            addTableToPage(i, doc);
        }


        /*
        addHeader();
        // Automatically handle headers on each page and content overflow
        doc.autoTable({
            startY: 100,
            head: [tableColumn],
            body: tableRows,
            margin: { horizontal: 10 },
            styles: { fontSize: 10 },


        });
        */

        doc.save('invoice.pdf');
    };

    return (
        <div>
            <h1>Invoice Form</h1>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleAddItem();
                }}
            >
                <div>
                    <label>Item Name:</label>
                    <input
                        type="text"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}

                    />
                </div>
                <div>
                    <label>Quantity:</label>
                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}

                    />
                </div>
                <div>
                    <label>Rate:</label>
                    <input
                        type="number"
                        step="0.01"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}

                    />
                </div>
                <button type="submit">Add Item</button>
            </form>

            {items.length > 0 && (
                <div>
                    <h2>Items List:</h2>
                    <ul>
                        {items.map((item, index) => (
                            <li key={index}>
                                {item.itemName} - Qty: {item.quantity} - Rate: ${item.rate.toFixed(2)} - Total: ${item.total.toFixed(2)}
                            </li>
                        ))}
                    </ul>
                    <button onClick={handleGeneratePDF}>Generate PDF</button>
                </div>
            )}
        </div>
    );
}

export default PDFGen2
