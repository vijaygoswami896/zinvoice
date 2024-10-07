// backend/server.js
const express = require('express');
const bodyParser = require('body-parser');
const { Document, Packer, Table, TableRow, TableCell, Paragraph, WidthType, PageSize, Header, TextRun, AlignmentType, Footer, VerticalAlign, BorderStyle, Numbering } = require('docx');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { exec } = require('child_process');
const convertToPdf = require('docx-pdf');

const app = express();
const port = 5000;


app.use(bodyParser.json());
app.use(cors());

app.post('/write-to-file', (req, res) => {
    const { date, partyName, partyAddress, billType, data } = req.body;
    //console.log('Received data:', data); // Log the received data for debugging

    const totalAmount = data.reduce((accumulator, item) => {
        return accumulator += (item.quantity * item.rate)
    }, 0);
    //console.log("totalAmount : ", totalAmount);

    const formatDate = (inputDate) => {
        const date = new Date(inputDate);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear());

        return `${day}/${month}/${year}`;
    }

    const formattedDate = formatDate(date);

    if (!date || !partyName || !Array.isArray(data)) {
        return res.status(400).send('Invalid request data. Ensure date, partyName, partyAddress, and data array are provided.');
    }

    try {
        // Define the business header content
        const businessHeader = new Header({
            children: [
                new Paragraph({
                    children: [
                        new TextRun({
                            text: 'Mobile : (1) 9426448570',
                            size: 24,
                            bold: 'true',
                        }),
                    ],
                    alignment: 'right',
                }),

                new Paragraph({
                    children: [
                        new TextRun({
                            text: '(2) 9173037132',
                            size: 24,
                            bold: 'true',
                        }),
                    ],
                    alignment: 'right',
                }),

                new Paragraph({
                    children: [
                        new TextRun({
                            text: 'SUBHASH GOSVAMI',
                            bold: 'true',
                            size: 48,
                        })
                    ],
                    heading: 'Heading1',
                    alignment: 'center',

                }),

                new Paragraph({
                    children: [
                        new TextRun({
                            text: 'ALL TYPES OF ELECTRICAL & CABLING WORKS',
                            size: 24,
                            font: 'Calibri (Body)'
                        }),
                    ],
                    alignment: 'center',
                }),

                new Paragraph({
                    children: [
                        new TextRun({
                            text: 'D-63/301, Swaminarayan Park, Haridarshan Char Rasta, New Naroda, Ahmedabad-382330',
                            size: 24,
                            font: 'Calibri (Body)'
                        }),
                    ],

                    alignment: 'center',

                    border: {
                        bottom: {
                            color: "auto",
                            space: 2,
                            style: "single",
                            size: 6,
                        },
                    },
                }),

                new Paragraph({
                    children: [
                        new TextRun({
                            text: '',
                        }),
                    ],
                }),

                new Paragraph({
                    alignment: AlignmentType.LEFT, // Align text to both left and right

                    children: [
                        new TextRun({
                            text: 'To,',
                            size: 24, // Font size (1/2 point size; 24 = 12pt)
                            font: 'Calibri (Body)', // Font family
                            bold: true, // Bold text                        
                        }),

                        new TextRun({
                            text: '\t',
                        }),

                        new TextRun({
                            text: 'Date : ' + formattedDate,
                            size: 24, // Font size (1/2 point size; 24 = 12pt)
                            font: 'Calibri (Body)', // Font family
                            bold: true, // Bold text
                            alignment: AlignmentType.RIGHT,
                        }),
                    ],
                    tabStops: [
                        {
                            position: 8500, // Position of the right-aligned text
                            //type: TabStopPositionType.RIGHT,
                        },
                    ],
                }),

                new Paragraph({
                    children: [
                        new TextRun({
                            text: '\t' + partyName,
                            size: 24, // Font size (1/2 point size; 24 = 12pt)
                            font: 'Calibri (Body)', // Font family
                            bold: false, // Bold text 
                        }),
                    ],
                }),

                new Paragraph({
                    children: [
                        new TextRun({
                            text: '\t' + partyAddress,
                            size: 24, // Font size (1/2 point size; 24 = 12pt)
                            font: 'Calibri (Body)', // Font family
                            bold: false, // Bold text 
                        }),
                    ],
                }),

                new Paragraph({
                    children: [
                        new TextRun({
                            text: billType,
                            size: 24, // Font size (1/2 point size; 24 = 12pt)
                            font: 'Calibri (Body)', // Font family
                            bold: true, // Bold text   
                            underline: true,
                        }),
                    ],
                    alignment: AlignmentType.CENTER,
                    spacing: {
                        after: 100,
                    },
                }),

                /*  new Paragraph({
                     children: [
                         new TextRun({
                             text: '',
                         }),
                     ],
                 }), */

            ],
        });

        /* const businessFooter = new Footer({
            children: [
                new Paragraph({
                    children: [
                        new TextRun({
                            text: '',
                        }),
                    ],
                }),
    
                new Paragraph({
                    children: [
                        new TextRun({
                            text: 'For, Subhashchandra Goswami',
                            bold: 'true',
                            size: 24,
                        }),
                    ],
                    alignment: 'right',
                }),
            ],
    
    
        }); */

        // Define the footer with a table of 1 row and 2 columns
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
            ],
        });

        // Define font style and size
        const fontStyle = {
            size: 22, // Font size (1/2 point size; 24 = 12pt)
            font: 'Calibri (Body)', // Font family
            bold: false, // Bold text
            italics: false, // Italic text
        };

        // Function to create a Paragraph with styled TextRun
        const createStyledHeading = (text, alignment, indentation = 0) => {
            return new Paragraph({
                children: [
                    new TextRun({
                        text: text,
                        size: 24, // Font size (1/2 point size; 24 = 12pt)
                        font: 'Calibri (Body)', // Font family
                        bold: true, // Bold text
                    }),

                ],

                /* spacing: { before: 200, after: 200 }, */
                alignment: alignment,
                indent: {
                    left: indentation, // Adjust indentation (in half-points)

                },

            });
        };

        // Function to create a Paragraph with styled TextRun
        const createStyledParagraph = (text, alignment, indentation = 0) => {
            return new Paragraph({
                children: [
                    new TextRun({
                        text: text,
                        size: fontStyle.size,
                        font: fontStyle.font,
                        bold: fontStyle.bold,
                        italics: fontStyle.italics,

                    }),
                ],
                /* spacing: { before: 200, after: 200 }, */
                alignment: alignment,
                indent: {
                    left: indentation, // Adjust indentation (in half-points)

                },

            });
        };


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

        // Define the table structure
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

        const doc = new Document({
            sections: [
                {
                    properties: {
                        page: {
                            size: PageSize.A4,
                            margin: {
                                top: 284,    // 0.25 inches = 360 twips
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

        Packer.toBuffer(doc).then((buffer) => {
            //fs.writeFileSync(path.resolve(__dirname, `output_${Date.now()}.docx`), buffer);
            //res.send('Data written to file successfully!');
            res.setHeader('Content-Disposition', 'attachment; filename=invoice.docx');
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.send(buffer);
        }).catch((error) => {
            console.error('Error writing to file:', error); // Log the error for debugging
            res.status(500).send('Error writing to file');
        });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).send('Error processing request');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
