// Importing the easyinvoice library
const easyinvoice = require('easyinvoice');

// Sample data for the invoice
const data = {
  //"documentTitle": "RECEIPT", // Defaults to "INVOICE"
  "currency": "USD",          // See ISO 4217 for currency codes
  "taxNotation": "vat",        // VAT = value added tax
  "marginTop": 25,
  "marginRight": 25,
  "marginLeft": 25,
  "marginBottom": 25,
  "logo": "https://www.example.com/logo.png", // or base64
  "sender": {
    "company": "Your Company",
    "address": "123 Street, City",
    "zip": "12345",
    "city": "City",
    "country": "Country",
  },
  "client": {
    "company": "Client Company",
    "address": "456 Street, City",
    "zip": "67890",
    "city": "City",
    "country": "Country",
  },
  "invoiceNumber": "20220101",
  "invoiceDate": "2024-01-07",
  "products": [
    {
      "quantity": 2,
      "description": "Product 1",
      "tax": 0.21,
      "price": 10,
    },
    {
      "quantity": 1,
      "description": "Product 2",
      "tax": 0.21,
      "price": 20,
    },
  ],
  "bottomNotice": "Thank you for your business!",
};

// Creating the invoice
easyinvoice.createInvoice(data, function (result) {
  // Result is a Buffer containing the PDF file
  // Save the PDF to a file or send it as a response to the client
  const fs = require('fs');
  fs.writeFileSync('invoice.pdf', result.pdf, 'base64');
  console.log('Invoice created successfully!');
});
