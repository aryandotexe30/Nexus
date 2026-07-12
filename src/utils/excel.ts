import * as XLSX from 'xlsx';

export interface ParsedCompany {
  name: string;
  address: string;
  pincode: string;
}

export function parseExcelInput(file: File): Promise<ParsedCompany[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Assume row 1 is headers (Company Name, Address, Pincode)
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const companies: ParsedCompany[] = [];
        
        // Skip header row
        for (let i = 1; i < jsonData.length; i++) {
          const row: any = jsonData[i];
          if (row[0]) {
            companies.push({
              name: String(row[0] || ''),
              address: String(row[1] || ''),
              pincode: String(row[2] || '')
            });
          }
        }
        resolve(companies);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
}

export function formatReadableText(val: any, indentLevel = 0): string {
  if (val === null || val === undefined || val === '') return '-';
  
  let parsed = val;
  if (typeof val === 'string') {
    try { parsed = JSON.parse(val); } catch (e) { return val; }
  }

  const indent = '  '.repeat(indentLevel);
  
  if (Array.isArray(parsed)) {
    return parsed.map(item => `${indent}• ${formatReadableText(item, indentLevel).trimStart()}`).join('\n');
  }
  
  if (typeof parsed === 'object') {
    return Object.entries(parsed)
      .map(([k, v]) => {
        const cleanKey = k.replace(/_/g, ' ').toUpperCase();
        const formattedValue = formatReadableText(v, indentLevel + 1);
        if (formattedValue.includes('\n') && typeof v === 'object') {
          return `${indent}${cleanKey}:\n${formattedValue}`;
        }
        return `${indent}${cleanKey}: ${formattedValue}`;
      })
      .join('\n');
  }

  return String(parsed);
}

export function generateExportExcel(data: any[]) {
  const wb = XLSX.utils.book_new();

  // Overview Sheet
  const overviewData = data.map(item => ({
    "Company Name": item.company_input?.name,
    "Address": item.company_input?.address,
    "Pincode": item.company_input?.pincode,
    "GST Number": formatReadableText(item.extracted_data?.gst_number),
    "Summary": formatReadableText(item.extracted_data?.all_available_info)
  }));
  const wsOverview = XLSX.utils.json_to_sheet(overviewData);
  XLSX.utils.book_append_sheet(wb, wsOverview, "Overview");

  // Financials Sheet
  const financialData = data.map(item => ({
    "Company Name": item.company_input?.name,
    "Financials": formatReadableText(item.extracted_data?.financials),
    "Goods Sold": formatReadableText(item.extracted_data?.goods_sold),
    "Goods Purchased": formatReadableText(item.extracted_data?.goods_purchased),
    "Profits": formatReadableText(item.extracted_data?.profits_made),
    "Losses": formatReadableText(item.extracted_data?.loss_made)
  }));
  const wsFinancials = XLSX.utils.json_to_sheet(financialData);
  XLSX.utils.book_append_sheet(wb, wsFinancials, "Financials");

  // Personnel Sheet
  const personnelData = data.map(item => ({
    "Company Name": item.company_input?.name,
    "Sales People": formatReadableText(item.extracted_data?.sales_people),
    "Board of Directors": formatReadableText(item.extracted_data?.board_of_directors),
    "HR Contacts": formatReadableText(item.extracted_data?.hr_contacts)
  }));
  const wsPersonnel = XLSX.utils.json_to_sheet(personnelData);
  XLSX.utils.book_append_sheet(wb, wsPersonnel, "Personnel");

  // Products & News Sheet
  const productsNewsData = data.map(item => ({
    "Company Name": item.company_input?.name,
    "Products & Services": formatReadableText(item.extracted_data?.products_and_services),
    "Economic Times Info": formatReadableText(item.extracted_data?.economic_times_info)
  }));
  const wsProducts = XLSX.utils.json_to_sheet(productsNewsData);
  XLSX.utils.book_append_sheet(wb, wsProducts, "Products & News");

  // Generate and download
  XLSX.writeFile(wb, "Enriched_Company_Data.xlsx");
}
