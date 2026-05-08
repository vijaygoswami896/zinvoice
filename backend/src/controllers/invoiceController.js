// backend/controllers/invoiceController.js

const { generateDocument } = require('../services/documentService');

const writeToFile = async (req, res) => {
    const { date, partyName, partyAddress, billType, data } = req.body;

    if (!date || !partyName || !Array.isArray(data)) {
        return res.status(400).send(
            'Invalid request data. Ensure date, partyName, partyAddress, and data array are provided.'
        );
    }

    try {
        const buffer = await generateDocument({
            date,
            partyName,
            partyAddress,
            billType,
            data,
        });

        res.setHeader(
            'Content-Disposition',
            'attachment; filename=invoice.docx'
        );

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        );

        res.send(buffer);
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).send('Error processing request');
    }
};

module.exports = {
    writeToFile,
};