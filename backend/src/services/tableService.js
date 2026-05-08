// backend/services/tableService.js

const {
    Table,
    TableRow,
    TableCell,
    Paragraph,
    TextRun,
    WidthType,
    AlignmentType,
} = require('docx');

const {
    createStyledHeading,
    createStyledParagraph,
} = require('./paragraphService');

const { fontStyle } = require('../config/constants');

const createInvoiceTable = ({ data, totalAmount }) => {

    // PASTE YOUR COMPLETE TABLE CODE HERE EXACTLY AS IT IS
    const headingRow = new TableRow({
        children: [
            new TableCell({
                children: [createStyledHeading('S.N.', AlignmentType.CENTER)],
                width: {
                    size: 7, // Percentage of the page width
                    type: WidthType.PERCENTAGE,
                },
                margins: {
                    top: 100,
                    bottom: 100,
                },
                verticalAlign: 'center',
            }),

            new TableCell({
                children: [createStyledHeading('Description', AlignmentType.CENTER)],
                width: {
                    size: 59, // Percentage of the page width
                    type: WidthType.PERCENTAGE,
                },
                verticalAlign: 'center',
            }),

            new TableCell({
                children: [createStyledHeading('Qty.', AlignmentType.CENTER)],
                width: {
                    size: 7, // Percentage of the page width
                    type: WidthType.PERCENTAGE,
                },
                verticalAlign: 'center',
            }),

            new TableCell({
                children: [createStyledHeading('Unit', AlignmentType.CENTER)],
                width: {
                    size: 5, // Percentage of the page width
                    type: WidthType.PERCENTAGE,
                },
                verticalAlign: 'center',
            }),

            new TableCell({
                children: [createStyledHeading('Rate\n(Rs.)', AlignmentType.CENTER)],
                width: {
                    size: 10, // Percentage of the page width
                    type: WidthType.PERCENTAGE,
                },
                verticalAlign: 'center',
            }),

            new TableCell({
                children: [createStyledHeading('Total\n(Rs.)', AlignmentType.CENTER)],
                width: {
                    size: 12, // Percentage of the page width
                    type: WidthType.PERCENTAGE,
                },
                verticalAlign: 'center',
            }),

        ],
        tableHeader: true,  // Ensures that this row repeats as a header on each page
    })

    const totalAmountRow = new TableRow({
        children: [
            new TableCell({
                children: [
                    new Paragraph({
                        text: ''
                    }),
                ],
            }),

            new TableCell({
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: 'Total',
                                bold: true,
                                font: fontStyle.font,
                                size: fontStyle.size,
                            }),
                        ],
                        alignment: 'center',
                    }),
                ],
                margins: {
                    top: 50,
                    bottom: 50,
                },
                verticalAlign: 'center',
                columnSpan: 3,
            }),

            new TableCell({
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: totalAmount.toFixed(2).toString(),
                                bold: true,
                                font: fontStyle.font,
                                size: fontStyle.size,
                            }),
                        ],
                        alignment: 'right',
                    }),
                ],
                margins: {
                    right: 100,
                },
                verticalAlign: 'right',
                columnSpan: 2,
            }),
        ]  // Ensures that this row repeats as a header on each page
    })

    const table = new Table({
        // Set table properties for full width
        width: {
            size: 100, // Percentage of the page width
            type: WidthType.PERCENTAGE,
        },

        rows: [
            headingRow,     // Heading row that will repeat on every page

            ...data.map((item, index) => new TableRow({
                children: [
                    new TableCell({
                        children: [new Paragraph({
                            children: [
                                new TextRun({
                                    text: (index + 1).toString() + '.',
                                    size: 22, // Font size (1/2 point size; 24 = 12pt)
                                    font: 'Calibri (Body)', // Font family
                                    bold: true, // Bold text
                                    verticalAlign: 'center',
                                })
                            ],
                            alignment: AlignmentType.CENTER,
                        })]

                        /* createStyledParagraph((index + 1).toString() + '.', AlignmentType.CENTER) */
                    }),

                    new TableCell({ children: [createStyledParagraph(item.name || 'N/A', AlignmentType.LEFT, 50)], verticalAlign: 'center', }),

                    new TableCell({ children: [createStyledParagraph(item.quantity !== undefined ? item.quantity.toString() : 'N/A', AlignmentType.CENTER)], verticalAlign: 'center', }),

                    new TableCell({
                        children: [
                            createStyledParagraph(item.unit !== undefined ? item.unit.toString() : 'N/A', AlignmentType.CENTER)
                        ],
                        verticalAlign: 'center',
                    }),

                    new TableCell({
                        children: [
                            createStyledParagraph(Number(item.rate).toFixed(2), AlignmentType.RIGHT)
                        ],
                        margins: {
                            //top: 40, // Top padding
                            //bottom: 40, // Bottom padding
                            //left: 00, // Left padding
                            right: 100, // Right padding
                        },
                        verticalAlign: 'center',
                    }),

                    new TableCell({
                        children: [
                            createStyledParagraph(item.rate !== undefined ? ((item.rate * item.quantity).toFixed(2)).toString() : 'N/A', AlignmentType.RIGHT)
                        ],
                        margins: {
                            //top: 80, // Top padding
                            //bottom: 80, // Bottom padding
                            //left: 00, // Left padding
                            right: 80, // Right padding
                        },
                        verticalAlign: 'center',
                    }),
                ],
            })),

            totalAmountRow,
        ],
    });

};

module.exports = {
    createInvoiceTable,
};