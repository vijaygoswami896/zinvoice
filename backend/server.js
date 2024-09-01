const express = require('express');
const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const cors = require('cors')

const app = express();

app.use(express.json());
app.use(cors());

app.post('/generate-invoice', (req, res) => {
    const products = req.body.products;

    // Calculate the total for each product
    const productsWithTotal = products.map(product => ({
        ...product,
        total: product.qty * product.rate
    }));

    // Load the Word template
    const templatePath = path.join(__dirname, 'template.docx');
    const content = fs.readFileSync(templatePath, 'binary');

    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip);

    // Replace placeholders with actual data
    doc.setData({
        products: productsWithTotal
    });

    try {
        // Render the document
        doc.render();
    } catch (error) {
        res.status(500).send('Error rendering document');
        return;
    }

    // Generate output file
    const output = doc.getZip().generate({ type: 'nodebuffer' });

    const outputPath = path.join(__dirname, 'output.docx');
    fs.writeFileSync(outputPath, output);

    // Send the generated file as a response
    res.sendFile(outputPath);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
