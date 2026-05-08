// backend/services/footerService.js

const {
    Footer,
    Table,
    TableRow,
    TableCell,
    Paragraph,
    TextRun,
    WidthType,
    BorderStyle,
    AlignmentType,
    PageNumber,
} = require('docx');

const {
    myFont,
    myFontSize,
} = require('../config/constants');

const createBusinessFooter = () => {

    const myTextRunForFooter = (children) => {
        return new TextRun({
            children,
            size: myFontSize,
            font: myFont,
            bold: true,
        });
    };

    const noBorders = () => ({
        top: { size: 0, color: "#ffffff" },
        bottom: { size: 0, color: "#ffffff" },
        left: { size: 0, color: "#ffffff" },
        right: { size: 0, color: "#ffffff" },
    });

    // PASTE YOUR COMPLETE FOOTER CODE HERE EXACTLY AS IT IS

    const pageNumberTable = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        children: [
                            new Paragraph({
                                children: [
                                    myTextRunForFooter(['Page ', PageNumber.CURRENT]),

                                    myTextRunForFooter([' of ', PageNumber.TOTAL_PAGES]),
                                ],
                                alignment: 'right',
                                verticalAlign: 'center',
                            }),
                        ],
                        borders: noBorders(),
                        alignment: 'right',
                        verticalAlign: 'center',
                    }),
                ],
            }),
        ],

    });

    const footerTable = new Table({
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: 'A/C No : 10006840382',
                                        size: 24, // Font size (1/2 point size; 24 = 12pt)
                                        bold: true, // Bold text
                                    }),
                                    new TextRun({
                                        text: '\t', // This creates a line break

                                    }),
                                    new TextRun({
                                        text: 'IFSC : SBIN0011798',
                                        size: 24, // Font size (1/2 point size; 24 = 12pt)
                                        bold: true, // Bold text
                                    }),
                                ],


                                alignment: AlignmentType.LEFT,
                            })
                        ],
                        width: {
                            size: 50, // Width in % of the page width
                            type: WidthType.PERCENTAGE
                        },
                        margins: {
                            top: 100,
                            bottom: 400,
                            left: 100,
                        },

                        verticalAlign: 'center',
                    }),
                    new TableCell({
                        children: [new Paragraph({
                            children: [
                                new TextRun({
                                    text: 'For, Subhashchandra Gosvami',
                                    size: 24, // Font size (1/2 point size; 24 = 12pt)
                                    bold: true, // Bold text
                                }),
                            ],
                            alignment: AlignmentType.RIGHT
                        })],
                        width: {
                            size: 50, // Width in % of the page width
                            type: WidthType.PERCENTAGE
                        },
                        margins: {
                            top: 100,
                            bottom: 100,
                            right: 300,
                        },

                    }),
                ],
            }),
        ],
        width: {
            size: 100, // Width of the table as a percentage of the page width
            type: WidthType.PERCENTAGE
        },
        borders: {
            top: {
                color: "auto",
                style: "single",
                size: 6,
            },
            left: {
                color: "auto",
                style: "single",
                size: 6,
            },
            right: {
                color: "auto",
                style: "single",
                size: 6,
            },
            bottom: {
                style: BorderStyle.NONE, // No border for the bottom
            },
        },
    });

    const businessFooter = new Footer({
        children: [
            ...Array(1).fill(new Paragraph({ children: [new TextRun({ text: '' })] })),

            footerTable,
            singleLineSpace,
            pageNumberTable,
        ],
    });

};

module.exports = {
    createBusinessFooter,
};