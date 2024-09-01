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
    const mobile1 = "Mobile : +91 94264 48570";
    const mobile2 = "+91 91730 37132";
    const businessName = "SUBHASH GOSVAMI";
    const businessDetails = "ALL TYPES OF ELECTRICAL & CABLING WORKS";
    const address = "D-63/301, Swaminarayan Park, Haridarshan Char Rasta, New Naroda, Ahmedabad-382330";
    const partyDetails = "Univarsal Software";
    const date = new Date().toLocaleDateString();

    const addHeader = (doc) => {
        const pageWidth = doc.internal.pageSize.getWidth();

        doc.setFontSize(25);
        doc.setFont("helvetica", "bold");
        const businessNameWidth = doc.getTextWidth(businessName);
        const businessNameX = (pageWidth - businessNameWidth) / 2;
        doc.text(businessName, businessNameX, 30);

        doc.setFont("helvetica", "normal");

        doc.setFontSize(12);
        const businessDetailsWidth = doc.getTextWidth(businessDetails);
        const businessDetailsX = (pageWidth - businessDetailsWidth) / 2;
        doc.text(businessDetails, businessDetailsX, 36);

        const addressWidth = doc.getTextWidth(address);
        const addressX = (pageWidth - addressWidth) / 2;
        doc.text(address, addressX, 42);

        const lineX = 10;
        const lineY = 48;
        const lineWidth = pageWidth - 20;
        doc.setLineWidth(0.5);
        doc.line(lineX, lineY, lineX + lineWidth, lineY);

        const marginRight = 10;
        doc.setFontSize(12);
        doc.text(mobile1, pageWidth - marginRight, 10, { align: 'right' });
        doc.text(mobile2, pageWidth - marginRight, 15, { align: 'right' });
        doc.text(partyDetails, 10, 65);
        doc.text(`Date: ${date}`, 10, 70);

        doc.setFontSize(16);
        doc.text('Invoice', 10, 80);
    };

    const handleGeneratePDF = () => {
        const doc = new jsPDF();
        const entriesPerPage = 30;
        const totalPages = Math.ceil(items.length / entriesPerPage);

        const addPageContent = (pageIndex) => {
            if (pageIndex > 0) doc.addPage();
            addHeader(doc);

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
                startY: 90, // Adjust if header space changes
                head: [tableColumn],
                body: tableRows,
                margin: { horizontal: 10 },
                styles: { fontSize: 10 }
            });
        };

        for (let i = 0; i < totalPages; i++) {
            addPageContent(i);
        }

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
                        required
                    />
                </div>
                <div>
                    <label>Quantity:</label>
                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Rate:</label>
                    <input
                        type="number"
                        step="0.01"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                        required
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

export default PDFGen2;
