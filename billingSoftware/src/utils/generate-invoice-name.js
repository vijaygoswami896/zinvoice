export const generateInvoiceName = (customerName, invoiceNumber) => {
    const fileName = `${customerName.toUpperCase().split(' ').join('-')}-${invoiceNumber}`

    return fileName;
}