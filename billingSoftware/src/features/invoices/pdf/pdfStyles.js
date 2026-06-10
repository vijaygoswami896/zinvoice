import { StyleSheet, Font } from '@react-pdf/renderer';
import RobotoRegular from '@assets/fonts/Roboto-Regular.ttf';
import RobotoBold from '@assets/fonts/Roboto-Bold.ttf';
import RobotoItalic from '@assets/fonts/Roboto-Italic.ttf';
import RobotoBoldItalic from '@assets/fonts/Roboto-BoldItalic.ttf';

// ── Font registration ─────────────────────────────────────────────────────────
// Using built-in Helvetica — no external font fetch needed.
// If you add a custom font later, register it here and update fontFamily below.

// ── Shared tokens ─────────────────────────────────────────────────────────────
const TOKEN = {
  black: '#1a1a1a',
  darkGray: '#333333',
  midGray: '#555555',
  lightGray: '#888888',
  borderLight: '#dddddd',
  borderMid: '#bbbbbb',
  bgSubtle: '#f5f5f5',
  bgHeader: '#f0f0f0',
  white: '#ffffff',

  // Modern template accent
  accent: '#1a5276',
  accentLight: '#d6e4f0',
  accentMid: '#2e86c1',
};

Font.register({
  family: 'Roboto',
  fonts: [
    { src: RobotoRegular, fontWeight: 'normal', fontStyle: 'normal' },
    { src: RobotoBold, fontWeight: 'bold', fontStyle: 'normal' },
    { src: RobotoItalic, fontWeight: 'normal', fontStyle: 'italic' },
    { src: RobotoBoldItalic, fontWeight: 'bold', fontStyle: 'italic' },
  ],
});

// ── Classic template (mirrors your Word screenshot) ───────────────────────────
export const classicStyles = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    fontSize: 9,
    color: TOKEN.black,
    paddingTop: 30,
    // paddingTop: 20,
    // paddingTop: 95,      // ← was 30; increased to clear the fixed header
    paddingBottom: 50,
    // paddingBottom: 30,
    // paddingHorizontal: 25,
    // paddingHorizontal: 36,
    paddingHorizontal: 27,
    backgroundColor: TOKEN.white,
  },

  // row 1
  headerRow1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontWeight: 'bold'
  },

  contactLine: {
    fontSize: 8,
    color: TOKEN.midGray,
    // textAlign: 'right',
    // textAlign: 'center',
    // marginTop: 1,
  },

  headerRow: {
    flexDirection: 'column',
    alignItems: 'center',
    // marginTop: 3,
    marginTop: 15,
    marginBottom: 3,
  },
  logoBox: {
    width: 70,
    height: 70,
  },
  logo: {
    width: 70,
    height: 70,
    objectFit: 'contain',
  },
  headerRight: {
    alignItems: 'center',
    paddingLeft: 0,
  },
  businessName: {
    fontSize: 16,
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    color: '#1a3a6b',
    marginBottom: 2,
  },
  businessTagline: {
    fontSize: 8,
    color: TOKEN.midGray,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  businessAddress: {
    fontSize: 8,
    color: TOKEN.midGray,
    // textAlign: 'right',
    textAlign: 'center',
  },
  // contactLine: {
  //   fontSize: 8,
  //   color: TOKEN.midGray,
  //   textAlign: 'right',
  //   // textAlign: 'center',
  //   marginTop: 1,
  // },
  gstinLine: {
    fontSize: 8,
    color: TOKEN.darkGray,
    // textAlign: 'right',
    textAlign: 'center',
    marginTop: 2,
    // fontFamily: 'Helvetica-Bold',
    fontFamily: 'Roboto',
    fontWeight: 'bold',
  },

  // Divider
  divider: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#1a3a6b',
    marginVertical: 6,
  },
  thinDivider: {
    borderBottomWidth: 0.5,
    borderBottomColor: TOKEN.borderLight,
    marginVertical: 4,
  },

  // Bill title
  billTitle: {
    fontSize: 10,
    // fontFamily: 'Helvetica-Bold',
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    textAlign: 'center',
    textDecoration: 'underline',
    marginBottom: 6,
    color: TOKEN.black,
  },

  // To / Date row
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  toBlock: {
    flex: 1,
  },
  toLabel: {
    fontSize: 8,
    color: TOKEN.midGray,
    marginBottom: 2,
  },
  customerName: {
    fontSize: 10,
    // fontFamily: 'Helvetica-Bold',
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    color: TOKEN.black,
  },
  customerSub: {
    fontSize: 8,
    color: TOKEN.darkGray,
    marginTop: 1,
  },
  customerGstin: {
    fontSize: 8,
    color: TOKEN.darkGray,
    marginTop: 1,
  },
  dateBlock: {
    alignItems: 'flex-end',
    minWidth: 120,
  },
  dateLabel: {
    fontSize: 9,
    color: TOKEN.darkGray,
  },
  invoiceNumberLine: {
    fontSize: 8,
    color: TOKEN.midGray,
    marginTop: 2,
  },

  // Table
  table: {
    width: '100%',
    marginTop: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: TOKEN.bgHeader,
    // backgroundColor: '#e8e8e8',  // darker so it's actually visible
    borderTopWidth: 0.5,
    borderTopColor: '#bbbbbb',      // ← separate instead of borderColor
    borderBottomWidth: 0.5,
    borderBottomColor: '#bbbbbb',   // ← separate instead of borderColor
    // borderColor: TOKEN.borderMid,
    paddingVertical: 4,
    minHeight: 20,        // ← add this
    alignItems: 'center',    // ← add this
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: TOKEN.borderLight,
    paddingVertical: 3,
    minHeight: 18,
    alignItems: 'center',    // ← add this
  },
  tableRowAlt: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: TOKEN.borderLight,
    paddingVertical: 3,
    backgroundColor: TOKEN.bgSubtle,
    minHeight: 18,
    alignItems: 'center',    // ← add this
  },

  // Column widths — must sum to 100%
  // colSn: {
  //   width: '3%', paddingHorizontal: 0.5, borderLeft: '1px solid #cccccc', borderRight: '1px solid #cccccc',
  // },
  // colDesc: { width: '28%', paddingHorizontal: 0.5, borderLeft: '1px solid #cccccc', borderRight: '1px solid #cccccc', },
  // colHsn: { width: '6%', paddingHorizontal: 0.5, borderLeft: '1px solid #cccccc', borderRight: '1px solid #cccccc', },
  // colQty: { width: '7%', paddingHorizontal: 0.5, borderLeft: '1px solid #cccccc', borderRight: '1px solid #cccccc', },
  // // colUnit: { width: '6%', paddingHorizontal: 0.5 },
  // colRate: { width: '7%', paddingHorizontal: 0.5, borderLeft: '1px solid #cccccc', borderRight: '1px solid #cccccc', },
  // colDiscPct: { width: '4%', paddingHorizontal: 0.5, borderLeft: '1px solid #cccccc', borderRight: '1px solid #cccccc', },
  // colDiscAmt: { width: '7%', paddingHorizontal: 0.5, borderLeft: '1px solid #cccccc', borderRight: '1px solid #cccccc', },
  // colTaxable: { width: '9%', paddingHorizontal: 0.5, borderLeft: '1px solid #cccccc', borderRight: '1px solid #cccccc', },
  // colGst: { width: '4%', paddingHorizontal: 0.5, borderLeft: '1px solid #cccccc', borderRight: '1px solid #cccccc', },
  // colCgst: { width: '8%', paddingHorizontal: 0.5, borderLeft: '1px solid #cccccc', borderRight: '1px solid #cccccc', },
  // colSgst: { width: '8%', paddingHorizontal: 0.5, borderLeft: '1px solid #cccccc', borderRight: '1px solid #cccccc', },
  // // colIgst: { width: '7%', paddingHorizontal: 0.5 },
  // colTotal: { width: '9%', paddingHorizontal: 0.5, borderLeft: '1px solid #cccccc', borderRight: '1px solid #cccccc', },

  colSn: { width: '3%', paddingHorizontal: 1.5 },
  colDesc: { width: '28%', paddingHorizontal: 1.5 },
  colHsn: { width: '6%', paddingHorizontal: 1.5 },
  colQty: { width: '7%', paddingHorizontal: 1.5 },
  colRate: { width: '7%', paddingHorizontal: 1.5 },
  colDiscPct: { width: '4%', paddingHorizontal: 1.5 },
  colDiscAmt: { width: '7%', paddingHorizontal: 1.5 },
  colTaxable: { width: '9%', paddingHorizontal: 1.5 },
  colGst: { width: '4%', paddingHorizontal: 1.5 },
  colCgst: { width: '8%', paddingHorizontal: 1.5 },
  colSgst: { width: '8%', paddingHorizontal: 1.5 },
  colTotal: { width: '9%', paddingHorizontal: 1.5 },

  // IGST-only column widths (fewer columns — redistribute space)
  colDescIgst: { width: '28%', paddingHorizontal: 2 },
  colTaxableIgst: { width: '10%', paddingHorizontal: 2 },
  colIgstOnly: { width: '7%', paddingHorizontal: 2 },
  colTotalIgst: { width: '10%', paddingHorizontal: 2 },

  // No-GST column widths (6 columns = 100%, no HSN)
  colSnNoGst: { width: '5%', paddingHorizontal: 2 },
  colDescNoGst: { width: '49%', paddingHorizontal: 2 },
  colQtyNoGst: { width: '10%', paddingHorizontal: 2 },
  // colUnitNoGst: { width: '10%', paddingLeft: 6, paddingRight: 2 },
  colRateNoGst: { width: '13%', paddingHorizontal: 2 },
  colTotalNoGst: { width: '13%', paddingHorizontal: 2 },

  cellText: {
    fontSize: 8,
    color: TOKEN.darkGray,
  },
  cellTextBold: {
    fontSize: 8,
    // fontFamily: 'Helvetica-Bold',
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    color: TOKEN.black,
  },
  cellTextRight: {
    fontSize: 8,
    color: TOKEN.darkGray,
    textAlign: 'right',
  },
  cellTextCenter: {
    fontSize: 8,
    color: TOKEN.darkGray,
    textAlign: 'center',
  },
  cellTextRightBold: {
    fontSize: 8,
    // fontFamily: 'Helvetica-Bold',
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    color: TOKEN.black,
    textAlign: 'right',
  },
  headerCellText: {
    fontSize: 8,
    // fontFamily: 'Helvetica-Bold',
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    // color: TOKEN.darkGray,
    color: '#1a1a1a',    // was TOKEN.darkGray — make it black
  },
  headerCellRight: {
    fontSize: 8,
    // fontFamily: 'Helvetica-Bold',
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    // color: TOKEN.darkGray,
    color: '#1a1a1a',    // was TOKEN.darkGray — make it black
    textAlign: 'right',
  },
  headerCellCenter: {
    fontSize: 8,
    // fontFamily: 'Helvetica-Bold',
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    // color: TOKEN.darkGray,
    color: '#1a1a1a',    // was TOKEN.darkGray — make it black
    textAlign: 'center',
  },

  // Totals block
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  totalsTable: {
    width: '45%',
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: TOKEN.borderLight,
  },
  totalsRowGrand: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: TOKEN.darkGray,
    marginTop: 2,
  },
  totalsLabel: {
    fontSize: 8,
    color: TOKEN.midGray,
  },
  totalsValue: {
    fontSize: 8,
    color: TOKEN.darkGray,
    textAlign: 'right',
  },
  totalsLabelBold: {
    fontSize: 9,
    // fontFamily: 'Helvetica-Bold',
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    color: TOKEN.black,
  },
  totalsValueBold: {
    fontSize: 9,
    // fontFamily: 'Helvetica-Bold',
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    color: TOKEN.black,
    textAlign: 'right',
  },

  // Amount in words
  amountWords: {
    marginTop: 6,
    fontSize: 8,
    color: TOKEN.darkGray,
    fontFamily: 'Roboto',
    fontStyle: 'italic',
  },
  amountWordsBold: {
    // fontFamily: 'Helvetica-Bold',
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    fontStyle: 'normal',
  },

  // Notes / Terms
  notesSection: {
    marginTop: 16,
    borderTopWidth: 0.5,
    borderTopColor: TOKEN.borderLight,
    paddingTop: 8,

    // marginTop: 16,
    // flexDirection: 'row',
    // justifyContent: 'space-between',
    // alignItems: 'flex-end',
    // borderTopWidth: 0.5,
    // borderTopColor: TOKEN.borderLight,
    // paddingTop: 8,
  },
  notesLabel: {
    fontSize: 8,
    // fontFamily: 'Helvetica-Bold',
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    color: TOKEN.midGray,
    marginBottom: 2,
  },
  notesText: {
    fontSize: 8,
    color: TOKEN.midGray,
  },

  // Footer
  footer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 0.5,
    borderTopColor: TOKEN.borderLight,
    paddingTop: 8,
  },
  bankBlock: {
    flex: 1,
  },
  bankLabel: {
    fontSize: 8,
    // fontFamily: 'Helvetica-Bold',
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    color: TOKEN.midGray,
    marginBottom: 3,
  },
  bankRow: {
    flexDirection: 'row',
    marginBottom: 1,
  },
  bankKey: {
    fontSize: 8,
    color: TOKEN.midGray,
    width: 80,
  },
  bankValue: {
    fontSize: 8,
    // fontFamily: 'Helvetica-Bold',
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    color: TOKEN.darkGray,
  },
  signatureBlock: {
    alignItems: 'flex-end',
    minWidth: 140,
  },
  signatureImage: {
    width: 80,
    height: 40,
    objectFit: 'contain',
    marginBottom: 4,
  },
  signatureLine: {
    borderTopWidth: 0.5,
    borderTopColor: TOKEN.borderMid,
    width: 120,
    marginBottom: 3,
  },
  signatureLabel: {
    fontSize: 8,
    color: TOKEN.midGray,
  },
  signatureNameBold: {
    fontSize: 8,
    // fontFamily: 'Helvetica-Bold',
    fontFamily: 'Roboto',
    fontWeight: 'bold',
    color: TOKEN.black,
  },
  // pageNumber: {
  //   fontSize: 7,
  //   color: TOKEN.lightGray,
  //   textAlign: 'center',
  //   marginTop: 6,
  // },
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    fontSize: 7,
    color: TOKEN.lightGray,
    textAlign: 'center',
  },
});

// ── Modern template ───────────────────────────────────────────────────────────
export const modernStyles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: TOKEN.black,
    paddingTop: 0,
    paddingBottom: 40,
    paddingHorizontal: 0,
    backgroundColor: TOKEN.white,
  },

  // Colored top band
  topBand: {
    backgroundColor: TOKEN.accent,
    paddingHorizontal: 36,
    paddingTop: 24,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  topBandLeft: {
    flex: 1,
  },
  topBandRight: {
    alignItems: 'flex-end',
  },
  businessName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: TOKEN.white,
    marginBottom: 2,
  },
  businessTagline: {
    fontSize: 8,
    color: '#a9cce3',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  businessAddress: {
    fontSize: 8,
    color: '#a9cce3',
  },
  contactLine: {
    fontSize: 8,
    color: '#a9cce3',
    marginTop: 1,
  },
  gstinLine: {
    fontSize: 8,
    color: TOKEN.white,
    fontFamily: 'Helvetica-Bold',
    marginTop: 3,
  },
  logo: {
    width: 60,
    height: 60,
    objectFit: 'contain',
    backgroundColor: TOKEN.white,
    borderRadius: 4,
    padding: 3,
  },

  // Invoice identity strip
  identityStrip: {
    backgroundColor: TOKEN.accentLight,
    paddingHorizontal: 36,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: TOKEN.accent,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  identityRight: {
    alignItems: 'flex-end',
  },
  invoiceNumber: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: TOKEN.accent,
  },
  invoiceDate: {
    fontSize: 8,
    color: TOKEN.accentMid,
    marginTop: 2,
  },
  dueDate: {
    fontSize: 8,
    color: TOKEN.accentMid,
    marginTop: 1,
  },

  // Body
  body: {
    paddingHorizontal: 36,
    marginTop: 12,
  },

  // To / From row
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  toBlock: {
    flex: 1,
    paddingRight: 16,
  },
  toLabel: {
    fontSize: 7,
    color: TOKEN.lightGray,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 3,
    fontFamily: 'Helvetica-Bold',
  },
  customerName: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: TOKEN.black,
    marginBottom: 2,
  },
  customerSub: {
    fontSize: 8,
    color: TOKEN.midGray,
    marginTop: 1,
  },
  customerGstin: {
    fontSize: 8,
    color: TOKEN.darkGray,
    fontFamily: 'Helvetica-Bold',
    marginTop: 2,
  },

  // Table
  table: {
    width: '100%',
    marginTop: 4,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: TOKEN.accent,
    paddingVertical: 5,
    paddingHorizontal: 2,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: TOKEN.borderLight,
    paddingVertical: 4,
    paddingHorizontal: 2,
    minHeight: 20,
  },
  tableRowAlt: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: TOKEN.borderLight,
    paddingVertical: 4,
    paddingHorizontal: 2,
    backgroundColor: TOKEN.accentLight,
    minHeight: 20,
  },

  colSn: { width: '5%', paddingHorizontal: 2 },
  colDesc: { width: '28%', paddingHorizontal: 2 },
  colHsn: { width: '10%', paddingHorizontal: 2 },
  colQty: { width: '7%', paddingHorizontal: 2 },
  colUnit: { width: '6%', paddingHorizontal: 2 },
  colRate: { width: '9%', paddingHorizontal: 2 },
  colTaxable: { width: '10%', paddingHorizontal: 2 },
  colGst: { width: '6%', paddingHorizontal: 2 },
  colCgst: { width: '7%', paddingHorizontal: 2 },
  colSgst: { width: '7%', paddingHorizontal: 2 },
  colIgst: { width: '7%', paddingHorizontal: 2 },
  colTotal: { width: '9%', paddingHorizontal: 2 },

  colDescIgst: { width: '30%', paddingHorizontal: 2 },
  colTaxableIgst: { width: '12%', paddingHorizontal: 2 },
  colIgstOnly: { width: '10%', paddingHorizontal: 2 },
  colTotalIgst: { width: '11%', paddingHorizontal: 2 },

  headerCellText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: TOKEN.white,
  },
  headerCellRight: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: TOKEN.white,
    textAlign: 'right',
  },
  cellText: {
    fontSize: 8,
    color: TOKEN.darkGray,
  },
  cellTextBold: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: TOKEN.black,
  },
  cellTextRight: {
    fontSize: 8,
    color: TOKEN.darkGray,
    textAlign: 'right',
  },
  cellTextRightBold: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: TOKEN.black,
    textAlign: 'right',
  },

  // Totals
  totalsSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    paddingHorizontal: 36,
  },
  totalsTable: {
    width: '45%',
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: TOKEN.borderLight,
  },
  totalsRowGrand: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    backgroundColor: TOKEN.accent,
    paddingHorizontal: 6,
    marginTop: 3,
    borderRadius: 2,
  },
  totalsLabel: {
    fontSize: 8,
    color: TOKEN.midGray,
  },
  totalsValue: {
    fontSize: 8,
    color: TOKEN.darkGray,
    textAlign: 'right',
  },
  totalsLabelBold: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: TOKEN.white,
  },
  totalsValueBold: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: TOKEN.white,
    textAlign: 'right',
  },

  amountWords: {
    marginTop: 6,
    fontSize: 8,
    color: TOKEN.midGray,
    fontStyle: 'italic',
    paddingHorizontal: 36,
  },
  amountWordsBold: {
    fontFamily: 'Helvetica-Bold',
    fontStyle: 'normal',
    color: TOKEN.darkGray,
  },

  notesSection: {
    marginTop: 10,
    paddingHorizontal: 36,
  },
  notesLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: TOKEN.lightGray,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notesText: {
    fontSize: 8,
    color: TOKEN.midGray,
  },

  footer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 36,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: TOKEN.accentLight,
  },
  bankBlock: {
    flex: 1,
  },
  bankLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: TOKEN.midGray,
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bankRow: {
    flexDirection: 'row',
    marginBottom: 1,
  },
  bankKey: {
    fontSize: 8,
    color: TOKEN.lightGray,
    width: 80,
  },
  bankValue: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: TOKEN.darkGray,
  },
  signatureBlock: {
    alignItems: 'flex-end',
    minWidth: 140,
  },
  signatureImage: {
    width: 80,
    height: 40,
    objectFit: 'contain',
    marginBottom: 4,
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: TOKEN.accent,
    width: 120,
    marginBottom: 3,
  },
  signatureLabel: {
    fontSize: 8,
    color: TOKEN.midGray,
  },
  signatureNameBold: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: TOKEN.accent,
  },
  pageNumber: {
    fontSize: 7,
    color: TOKEN.lightGray,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 36,
  },

  // Supply type badge
  supplyBadge: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  badge: {
    fontSize: 7,
    color: TOKEN.white,
    backgroundColor: TOKEN.accentMid,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    marginRight: 4,
  },
});
