// backend/services/paragraphService.js

const {
    Paragraph,
    TextRun,
} = require('docx');

const { fontStyle } = require('../config/constants');

const createStyledHeading = (text, alignment, indentation = 0) => {
    return new Paragraph({
        children: [
            new TextRun({
                text: text,
                size: 24,
                font: 'Calibri (Body)',
                bold: true,
            }),
        ],

        alignment: alignment,

        indent: {
            left: indentation,
        },
    });
};

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

        alignment: alignment,

        indent: {
            left: indentation,
        },
    });
};

module.exports = {
    createStyledHeading,
    createStyledParagraph,
};