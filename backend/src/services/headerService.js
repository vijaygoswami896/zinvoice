// backend/services/headerService.js

const {
    Header,
    Paragraph,
    TextRun,
    AlignmentType,
} = require('docx');

const createBusinessHeader = ({
    formattedDate,
    partyName,
    partyAddress,
    billType,
}) => {
    return new Header({
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
};

module.exports = {
    createBusinessHeader,
};