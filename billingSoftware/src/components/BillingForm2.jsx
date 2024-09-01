import React, { useState } from 'react';
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell } from 'docx';
import { saveAs } from 'file-saver';

function BillingForm() {
    const [products, setProducts] = useState([{ productName: '', qty: 1, rate: 0 }]);

    const handleInputChange = (index, event) => {
        const values = [...products];
        values[index][event.target.name] = event.target.value;
        setProducts(values);
    };

    const handleAddProduct = () => {
        setProducts([...products, { productName: '', qty: 1, rate: 0 }]);
    };

    const generateInvoice = () => {
        const doc = new Document();

        // Add a title
        doc.addSection({
            children: [
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "Invoice",
                            bold: true,
                            size: 36,
                        }),
                    ],
                    alignment: 'center',
                }),
                new Paragraph(' '), // Add space
                createProductTable(products)
            ],
        });

        // Save the document
        Packer.toBlob(doc).then(blob => {
            saveAs(blob, "invoice.docx");
        });
    };

    const createProductTable = (products) => {
        const rows = [
            new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph("Product Name")] }),
                    new TableCell({ children: [new Paragraph("Quantity")] }),
                    new TableCell({ children: [new Paragraph("Rate")] }),
                    new TableCell({ children: [new Paragraph("Total")] }),
                ],
            }),
        ];

        products.forEach(product => {
            const total = product.qty * product.rate;
            rows.push(
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph(product.productName)] }),
                        new TableCell({ children: [new Paragraph(product.qty.toString())] }),
                        new TableCell({ children: [new Paragraph(product.rate.toString())] }),
                        new TableCell({ children: [new Paragraph(total.toString())] }),
                    ],
                })
            );
        });

        return new Table({
            rows: rows,
        });
    };

    return (
        <div>
            <h2>Billing Software</h2>
            {products.map((product, index) => (
                <div key={index}>
                    <input
                        name="productName"
                        placeholder="Product Name"
                        value={product.productName}
                        onChange={(event) => handleInputChange(index, event)}
                    />
                    <input
                        name="qty"
                        type="number"
                        placeholder="Quantity"
                        value={product.qty}
                        onChange={(event) => handleInputChange(index, event)}
                    />
                    <input
                        name="rate"
                        type="number"
                        placeholder="Rate"
                        value={product.rate}
                        onChange={(event) => handleInputChange(index, event)}
                    />
                </div>
            ))}
            <button onClick={handleAddProduct}>Add Another Product</button>
            <button onClick={generateInvoice}>Generate Invoice</button>
        </div>
    );
}

export default BillingForm;
