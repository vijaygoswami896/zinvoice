// backend/services/documentService.js

const {
    Document,
    Packer,
    PageSize,
} = require('docx');

const { formatDate } = require('../utils/dateFormatter');

const { createBusinessHeader } = require('./headerService');
const { createBusinessFooter } = require('./footerService');
const { createInvoiceTable } = require('./tableService');

const generateDocument = async ({
    date,
    partyName,
    partyAddress,
    billType,
    data,
}) => {

    const totalAmount = data.reduce((accumulator, item) => {
        return accumulator += (item.quantity * item.rate)
    }, 0);

    const formattedDate = formatDate(date);

    const businessHeader = createBusinessHeader({
        formattedDate,
        partyName,
        partyAddress,
        billType,
    });

    const businessFooter = createBusinessFooter();

    const table = createInvoiceTable({
        data,
        totalAmount,
    });

    const doc = new Document({
        sections: [
            {
                properties: {
                    page: {
                        size: PageSize.A4,
                        margin: {
                            top: 284,
                            right: 720,
                            bottom: 284,
                            left: 720,
                            header: 500,
                            footer: 300,
                        },
                    },
                },

                children: [
                    table,
                ],

                headers: {
                    default: businessHeader,
                },

                footers: {
                    default: businessFooter,
                }
            },
        ],
    });

    return await Packer.toBuffer(doc);
};

module.exports = {
    generateDocument,
};