function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Broadcasts");
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({error: "Sheet 'Broadcasts' not found."})).setMimeType(ContentService.MimeType.JSON);
    }

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) {
      return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    }

    const headers = data[0];
    const rows = data.slice(1);
    
    const broadcasts = rows.map(row => {
      let obj = {};
      headers.forEach((header, i) => {
        let value = row[i];
        if (header === "images_drive_ids") {
          obj["images"] = value ? value.toString().split(",").map(s => s.trim()) : [];
        } else if (header === "video_drive_id") {
          obj["video"] = value ? value.toString().trim() : "";
        } else if (header === "cover_drive_id") {
          obj["cover"] = value ? value.toString().trim() : "";
        } else if (header === "date") {
           obj["date"] = value instanceof Date ? value.toISOString().split('T')[0] : value.toString();
        } else {
          obj[header] = value;
        }
      });
      return obj;
    }).filter(b => b.published === true || b.published === "TRUE" || b.published === "true");

    return ContentService.createTextOutput(JSON.stringify(broadcasts)).setMimeType(ContentService.MimeType.JSON);

  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({error: error.message})).setMimeType(ContentService.MimeType.JSON);
  }
}
