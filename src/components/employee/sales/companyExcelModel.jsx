import * as XLSX from "xlsx";


export const CompanyExcelModel = (company, row, headers) => {
 
 

    const config = companyConfigs[company];
    
    if (!config) return null;
    let rowObj = row;
    if (company === "Apex Labs Pvt Ltd" ||company ==="Bharat Serum and Vaccines"
        ||company ==="Gates Pharma"||company ==="Pulse Pharmaceuticals Pvt Ltd"
        ||company ==="Medmanor Organics Pvt Ltd"|| company ==="Syncom Formulations"
        ||company ==="Comed Chemicals" || company ==="Pulse Nutriscience Pvt Ltd"
        ||company ==="Sri Rathna Specialities" ||company ==="Charak Pharma Pvt ltd"
        ||company ==="unknown"  ||company ==="Johnson and Johnson Pvt Ltd" 
        ||company ==="Servier India Private Limited" ||company ==="Vedistry Pvt Ltd"
     ) {
        rowObj = {};
        headers.forEach((key, i) => rowObj[key] = row[i]);
    }
    
    const data = config.map(rowObj);    
    return config.isValid(data) ? data : null;
};


const year = new Date().getFullYear(); // 2025
export const shortYear = year % 100; // 25
function parseExcelDate(dateStr) {
  if (!dateStr) return "";
 
  const [day, mon, year] = dateStr.split("-");
  const months = {
    JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
    JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11
  };
 
  return new Date(year, months[mon.toUpperCase()], day);
}

function getExcelText(cell) {

  return typeof cell === "object"
    ? XLSX.SSF.format("yyyy-mm-dd", cell)  // same as Excel format
    : cell;
}

const companyConfigs = {
    // Alembic Pharmaceuticals Ltd - completed
    "Alembic Pharmaceuticals Ltd": {
        map: (row) => ({
            invoice_no: row["Inv No."] || "",
            invoice_date: row["Inv Date"] ? getExcelText(row["Inv Date"]) : "",
            customer_code: row["Party No."] || "",
            invoice_value: row["Rounding Invoice value"] || "",
        }),
        isValid: (data) => data.invoice_no && data.invoice_date && data.customer_code  && data.invoice_value
    },
    "Johnson and Johnson Pvt Ltd": {
        map: (row) => ({
            invoice_no: row["Inv. No."] || "",
            invoice_date: row["Inv. Date"] ? getExcelText(row["Inv. Date"]): "",
            customer_code: row["Customer Code"] || "",
            invoice_value: row["Amount"] || "",
        }),
        isValid: (data) => data.invoice_no && data.invoice_date && data.customer_code  && data.invoice_value
    },
    "Servier India Private Limited": {
        map: (row) => ({
            invoice_no: row["REF_NO"] || "",
            invoice_date: row["REF_DATE"] ? getExcelText(row["REF_DATE"]) : "",
            customer_code: row["CUSTOMER_CODE"] || "",
            invoice_value: row["DOCUMENT_AMT"] || "",
        }),
        isValid: (data) => data.invoice_no && data.invoice_date && data.customer_code  && data.invoice_value
    },
    //  "Charak Pharma Pvt ltd" - completed
    "Charak Pharma Pvt ltd": {
        map: (row) => ({
            invoice_no: row["INVDOCUMENTNO"] || "",
            invoice_date: row["Date"] ? getExcelText(row["Date"]) : "",
            customer_code: row["CustomerCode"] || "",
            invoice_value: row["Invoice Value"] || "",
        }),
        isValid: (data) => data.invoice_no && data.invoice_date && data.customer_code  && data.invoice_value
    },
    // "V Guard" - completed
    "V Guard": {
        map: (row) => ({
            invoice_no: row["Voucher No"] || "",
            invoice_date: row["Voucher Date"] ? getExcelText(row["Voucher Date"]) : "",
            customer_code: row["Party Code"] || "",
            invoice_value: row["Amount After Tax"] || "",
        }),
        isValid: (data) => data.invoice_no && data.invoice_date && data.customer_code  && data.invoice_value
    },
    // "Great White Electricals" - completed
    "Great White Electricals": {
        map: (row) => ({
            invoice_no: row["INVOICE NO"] || "",
            invoice_date: row["INV_DATE"] ? getExcelText(row["INV_DATE"]) : "",
            customer_code: row["CUSTOMER CODE"] || "",
            invoice_value: row["TOTAL AMOUNT"] || "",
        }),
        isValid: (data) => data.invoice_no && data.invoice_date && data.customer_code  && data.invoice_value
    },
    // "MSN Labs Pvt Ltd" - completed
    "MSN Labs Pvt Ltd": {
        map: (row) => ({
            invoice_no: row["Invoice No"] || "",
            invoice_date: row["Invoice Date"] ? getExcelText(row["Invoice Date"]) : "",
            customer_code: row["Customer"] || "",
            invoice_value: row["Invoice Amt"] || "",
        }),
        isValid: (data) => data.invoice_no && data.invoice_date && data.customer_code  && data.invoice_value
    },
    // Vedistry Pvt Ltd -completed
    "Vedistry Pvt Ltd": {
        map: (row) => ({
            invoice_no: row["INVDOCUMENTNO"] || "",
            invoice_date: row["Date"] ? getExcelText(row["Date"]) : "",
            customer_code: row["CustomerCode"] || "",
            invoice_value: row["Invoice Value"] || "",
        }),
        isValid: (data) => data.invoice_no && data.invoice_date && data.customer_code  && data.invoice_value
    },
 
    // Koye Pharmaceuticals - completed
    "Koye Pharmaceuticals": {
        map: (row) => ({
            invoice_no: row["INVOICE_ID"] || "",
            invoice_date: row["TRAN_DATE"] ? getExcelText(row["TRAN_DATE"]) : "",
            customer_code: row["CUST_CODE__BIL"] || "",
            invoice_value: row["NET_AMT"] || "0",
        }),
        isValid: (data) => data.invoice_no && data.invoice_date && data.customer_code  && data.invoice_value
    },
    //Sundyota Numanits Pvt Ltd - completed
    "Sundyota Numanits Pvt Ltd": {
        map: (row) => ({
            invoice_no: row["INVOICE NO"] || "",
            invoice_date: row["INV_DATE"] ? getExcelText(row["INV_DATE"]) : "",
            customer_code: row["CUSTOMER CODE"] || "",
            invoice_value: row["Total"] || "0",
        }),
        isValid: (data) => data.invoice_no && data.invoice_date && data.customer_code  && data.invoice_value
    },
    // "Apex Labs Pvt Ltd - completed
    "Apex Labs Pvt Ltd": {
        map: (rowObj) => ({
            invoice_no: rowObj["Inv no"] || "",
            invoice_date: rowObj["Inv Date"] ? getExcelText(rowObj["Inv Date"]) : "",
            customer_code: rowObj["PartyCode"] || "",
            invoice_value: rowObj["Bill Amount"] || "",
        }),
        isValid: (data) => data.invoice_no && data.invoice_date && data.customer_code  && data.invoice_value
    },
    // "Bharat Serum and Vaccines" - completed
    "Bharat Serum and Vaccines": {
        map: (rowObj) => ({
            invoice_no: rowObj["Inv no"] || "",
            invoice_date: rowObj["Inv Date"] ? getExcelText(rowObj["Inv Date"]) : "",
            customer_code: rowObj["PartyCode"] || "",
            invoice_value: rowObj["Bill Amount"] || "",
        }),
        isValid: (data) => data.invoice_no && data.invoice_date && data.customer_code  && data.invoice_value
    },
    // Gates Pharma - completed
    "Gates Pharma": {
        map: (rowObj) => ({
            invoice_no: rowObj["Inv no"] || "",
            invoice_date: rowObj["Inv Date"] ? getExcelText(rowObj["Inv Date"]) : "",
            customer_code: rowObj["PartyCode"] || "",
            invoice_value: rowObj["Bill Amount"] || "",
        }),
        isValid: (data) => data.invoice_no && data.invoice_date && data.customer_code  && data.invoice_value
    },
   
    // Medmanor Organics Pvt Ltd - completed
    "Medmanor Organics Pvt Ltd": {
        map: (rowObj) => ({
            invoice_no: rowObj["Doc No"] || "",
            invoice_date: rowObj["Doc Date"] ? getExcelText(rowObj["Doc Date"]) : "",
            customer_code: rowObj["Party Code"] || "",
            invoice_value: rowObj["Amount"] || "",
        }),
        isValid: (data) => data.invoice_no && data.invoice_date && data.customer_code  && data.invoice_value
    },
    // "Comed Chemicals  - ph/25/26/416  - completed
    "Comed Chemicals": {
        map: (rowObj) => ({
            invoice_no: `PH/${shortYear}${shortYear+1}/${rowObj["BILL NUMBER"]?.split('-')[1]}` || "",
            invoice_date: rowObj["BILL DATE"] ? getExcelText(rowObj["BILL DATE"]) : "",
            customer_code: rowObj["PARTY CODE"] || "",
            invoice_value: rowObj["NET AMT."] || "",
        }),
        isValid: (data) => data.invoice_no && data.invoice_date && data.customer_code  && data.invoice_value
    },
 
    // "Pulse Pharmaceuticals Pvt Ltd" - completed
    "Pulse Pharmaceuticals Pvt Ltd": {
        map: (rowObj) => ({
            invoice_no: rowObj["Doc No"] || "",
            invoice_date: rowObj["Doc Date"] ? getExcelText(rowObj["Doc Date"]) : "",
            customer_code: rowObj["Party Code"] || "",
            invoice_value: rowObj["Net Sales"] || "",
        }),
        isValid: (data) => data.invoice_no && data.invoice_date && data.customer_code  && data.invoice_value
    },
    // Sri Rathna Specialities - completed
    "Sri Rathna Specialities": {
        map: (rowObj) => ({
            invoice_no: rowObj["Inv no"] || "",
            invoice_date: rowObj["Inv Date"] ? getExcelText(rowObj["Inv Date"]) : '',
            customer_code: rowObj["PartyCode"] || "",
            invoice_value: rowObj["Bill Amount"] || "",
        }),
        isValid: (data) => data.invoice_no && data.invoice_date && data.customer_code  && data.invoice_value
    },
 
    // Pulse Nutriscience Pvt Ltd - completed
    "Pulse Nutriscience Pvt Ltd": {
        map: (rowObj) => ({
            invoice_no: rowObj["Voucher No"] || "",
            invoice_date: rowObj["Voucher Date"] ? getExcelText(rowObj["Voucher Date"]) : "",
            customer_code: rowObj["code"] || "",
            invoice_value: rowObj["Value"] || "",
        }),
        isValid: (data) => data.invoice_no && data.invoice_date
    },
    //Syncom Formulations -completed
    "Syncom Formulations": {
        map: (rowObj) => ({
            invoice_no: rowObj["EntryNo"] || "",
            invoice_date: rowObj["EntryDate"] ? getExcelText(rowObj["EntryDate"]): "",
            customer_code: rowObj["Alias"] || "",
            invoice_value: rowObj["Net Amt"] || "",
        }),
        isValid: (data) => data.invoice_no && data.invoice_date
    },
    "unknown":{
        map: (rowObj) => ({
            invoice_no: rowObj["Inv No"] || "",
            invoice_date: rowObj["Inv Dt"] ? getExcelText(rowObj["Inv Dt"]) : "",
            customer_code: rowObj["Cust Id"] || "",
            invoice_value: rowObj["Net Amnt"] || "",
        }),
        isValid: (data) => data.invoice_no && data.invoice_date
    }
};