function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('إذاعة المدرسة 🚀')
      .addItem('تحديث الموقع', 'triggerDeploy')
      .addToUi();
}

function triggerDeploy() {
  const ui = SpreadsheetApp.getUi();
  const githubUrl = "https://api.github.com/repos/abdulkhaliqemam/school-radio/dispatches";
  
  const options = {
    method: "post",
    contentType: "application/json",
    headers: {
      "Accept": "application/vnd.github.v3+json",
      "Authorization": "Bearer YOUR_GITHUB_TOKEN_HERE",
      "X-GitHub-Api-Version": "2022-11-28"
    },
    payload: JSON.stringify({
      event_type: "update-site"
    })
  };
  
  try {
    UrlFetchApp.fetch(githubUrl, options);
    ui.alert("نجاح! 🎉", "تم إرسال أمر التحديث إلى الخوادم. سيتم عرض البيانات الجديدة خلال 3 دقائق تقريباً.", ui.ButtonSet.OK);
  } catch (e) {
    ui.alert("خطأ", "حدث خطأ أثناء محاولة تحديث الموقع: " + e.message, ui.ButtonSet.OK);
  }
}

// دالة لاستخراج ID من رابط جوجل درايف
function extractDriveId(urlOrId) {
  if (!urlOrId) return "";
  const match = String(urlOrId).match(/(?:id=|d\/|id\/)([a-zA-Z0-9_-]{25,})/);
  return match ? match[1] : String(urlOrId).trim();
}

// قاموس لترجمة العناوين العربية إلى الإنجليزية للبرمجة
const headerMap = {
  "المعرف": "id",
  "id": "id",
  "العنوان": "title",
  "title": "title",
  "التاريخ": "date",
  "date": "date",
  "الموضوع": "topic",
  "topic": "topic",
  "القسم": "category",
  "category": "category",
  "المقدم": "presenter",
  "presenter": "presenter",
  "الفيديو": "video_drive_id",
  "video_drive_id": "video_drive_id",
  "الغلاف": "cover_drive_id",
  "cover_drive_id": "cover_drive_id",
  "الصور": "images_drive_ids",
  "images_drive_ids": "images_drive_ids",
  "الوصف": "description",
  "description": "description",
  "نشر": "published",
  "published": "published"
};

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

    const rawHeaders = data[0];
    const rows = data.slice(1);
    
    // تحويل العناوين للمتغيرات الإنجليزية
    const headers = rawHeaders.map(h => headerMap[String(h).trim()] || String(h).trim());

    const broadcasts = rows.map(row => {
      let obj = {};
      headers.forEach((header, i) => {
        let value = row[i];
        if (header === "images_drive_ids") {
          // يمكن للمستخدم الآن وضع روابط كاملة مفصولة بفاصلة
          obj["images"] = value ? String(value).split(/,|\n/).map(s => extractDriveId(s)).filter(id => id.length > 0) : [];
        } else if (header === "video_drive_id") {
          obj["video"] = extractDriveId(value);
        } else if (header === "cover_drive_id") {
          obj["cover"] = extractDriveId(value);
        } else if (header === "date") {
           obj["date"] = value instanceof Date ? value.toISOString().split('T')[0] : String(value);
        } else {
          obj[header] = value;
        }
      });
      return obj;
    }).filter(b => b.published === true || b.published === "TRUE" || b.published === "true" || b.published === "نعم");

    return ContentService.createTextOutput(JSON.stringify(broadcasts)).setMimeType(ContentService.MimeType.JSON);

  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({error: error.message})).setMimeType(ContentService.MimeType.JSON);
  }
}
