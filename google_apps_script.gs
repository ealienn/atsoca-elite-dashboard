/**
 * ==============================================================================
 * ATSOCA ELITE DASHBOARD - GOOGLE APPS SCRIPT BACKEND ENDPOINT
 * ==============================================================================
 * 
 * Instructions:
 * 1. Open your Google Sheet connected to your Google Form.
 * 2. Navigate to Extensions > Apps Script.
 * 3. Replace the script editor contents with this code.
 * 4. Save and click "Deploy" > "New Deployment" (or Manage Deployments > Edit > New Version).
 * 5. Select type "Web app":
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 * 6. Copy the generated Web App URL and paste it into js/dbState.js (GOOGLE_SHEETS_WEB_APP_URL).
 * ==============================================================================
 */

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Form Responses 1") || ss.getSheetByName("Form Responses") || ss.getSheetByName("Sheet1") || ss.getSheetByName("Responses");
    
    if (!sheet) {
      var allSheets = ss.getSheets();
      var maxRows = 0;
      for (var s = 0; s < allSheets.length; s++) {
        var curSheet = allSheets[s];
        var lastRow = curSheet.getLastRow();
        if (lastRow > maxRows) {
          maxRows = lastRow;
          sheet = curSheet;
        }
      }
    }
    
    if (!sheet) {
      sheet = ss.getActiveSheet();
    }

    var data = sheet.getDataRange().getValues();
    var records = [];
    
    // Header row is row 1 (index 0), data starts at row 2 (index 1)
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      
      // Column B (Index 1): Submission ID / Respondent ID
      // Column H (Index 7): 'code' column in Google Sheets
      var colB = String(row[1] || '').trim();
      var colH = String(row[7] || '').trim();
      var colE = String(row[4] || '').trim();
      var respondentId = colB;
      
      var eliteCode = null;

      // 1. Strict check on Column H (the 'code' column)
      if (colH === '4' || colH === '004') eliteCode = '004';
      else if (colH === '5' || colH === '005') eliteCode = '005';
      else if (colH === '6' || colH === '006') eliteCode = '006';
      else if (colH === '7' || colH === '007') eliteCode = '007';
      else if (colH === '8' || colH === '008') eliteCode = '008';

      // 2. If Column H is empty or non-numeric (e.g. member names entered as text), check names:
      if (!eliteCode && (!colH || isNaN(colH))) {
        var textTarget = (colH + ' ' + colB + ' ' + colE).toLowerCase();
        if (textTarget.indexOf('joshua') !== -1 || textTarget.indexOf('villafuerte') !== -1) eliteCode = '004';
        else if (textTarget.indexOf('kent') !== -1 || textTarget.indexOf('lontok') !== -1) eliteCode = '005';
        else if (textTarget.indexOf('ce box') !== -1 || textTarget.indexOf('ce.box') !== -1) eliteCode = '006';
        else if (textTarget.indexOf('charlene') !== -1 || textTarget.indexOf('hilvano') !== -1) eliteCode = '007';
        else if (textTarget.indexOf('jenelle') !== -1 || textTarget.indexOf('mangubat') !== -1) eliteCode = '008';
      }

      // Skip row completely if Column H contains 0, 1, 2, 3 or no valid Elite Code (004-008)
      if (!eliteCode) {
        continue;
      }
      
      // Column C: Enrollment Status (Index 2)
      var colC = String(row[2] || '').trim();
      var enrollmentStatus = colC !== '' ? colC : 'Enrolled';

      // Column E: Duplicate Checker (Index 4)
      var duplicateChecker = String(row[4] || '').trim();

      // Column G: Date Submitted (Index 6) - Date only, no time
      var rawColG = row[6];
      var dateSubmitted = '';
      if (rawColG instanceof Date) {
        var y = rawColG.getFullYear();
        var m = String(rawColG.getMonth() + 1).padStart(2, '0');
        var d = String(rawColG.getDate()).padStart(2, '0');
        dateSubmitted = y + '-' + m + '-' + d;
      } else {
        var strG = String(rawColG || '').trim();
        if (strG.indexOf(' ') !== -1) strG = strG.split(' ')[0];
        if (strG.indexOf('T') !== -1) strG = strG.split('T')[0];
        dateSubmitted = strG || new Date().toISOString().split('T')[0];
      }

      // Column N: Participant Name / Complete Name (Index 13)
      var participantName = String(row[13] || row[12] || row[8] || row[11] || '').trim() || ('Participant ' + i);
      
      // Column P: School / Company (Index 15)
      var schoolCompany = String(row[15] || row[14] || row[10] || row[13] || '').trim() || 'N/A';
      
      // Column S: Course / Program ('COSH' or 'BOSH') (Index 18)
      var courseChoiceRaw = String(row[18] || row[17] || '').trim().toUpperCase();
      var courseChoice = courseChoiceRaw.indexOf('COSH') !== -1 ? 'COSH' : 'BOSH';
      
      var fee = 0;
      var paid = 0;
      var balance = 0;
      
      if (courseChoice === 'COSH') {
        // Column V: COSH Training Fee (Index 21)
        // Column W: COSH Amount Paid (Index 22)
        // Column X: COSH Remaining Balance (Index 23)
        fee = Number(row[21] !== undefined && row[21] !== '' ? row[21] : row[20]) || 5000;
        paid = Number(row[22] !== undefined && row[22] !== '' ? row[22] : row[21]) || 0;
        balance = (row[23] !== undefined && row[23] !== '' && !isNaN(row[23])) ? Number(row[23]) : Math.max(0, fee - paid);
      } else {
        // Column AA: BOSH Training Fee (Index 26)
        // Column AB: BOSH Amount Paid (Index 27)
        // Column AC: BOSH Remaining Balance (Index 28)
        fee = Number(row[26] !== undefined && row[26] !== '' ? row[26] : row[24]) || 4500;
        paid = Number(row[27] !== undefined && row[27] !== '' ? row[27] : row[25]) || 0;
        balance = (row[28] !== undefined && row[28] !== '' && !isNaN(row[28])) ? Number(row[28]) : Math.max(0, fee - paid);
      }
      
      // Column AF: Payment Status (Index 31)
      var colAC = String(row[31] !== undefined && row[31] !== '' ? row[31] : row[28] || '').trim();
      var colACLower = colAC.toLowerCase();
      var paymentStatus = '';

      if (colACLower.indexOf('unpaid') !== -1) {
        paymentStatus = 'Unpaid';
      } else if (colACLower.indexOf('partial') !== -1) {
        paymentStatus = 'Partial';
      } else if (colACLower.indexOf('fully') !== -1 || colACLower === 'paid') {
        paymentStatus = 'Fully Paid';
      } else if (colAC !== '') {
        paymentStatus = colAC;
      } else {
        // Automatic Formula Calculation when Payment Status is empty
        if (paid >= fee && fee > 0) {
          paymentStatus = 'Fully Paid';
        } else if (paid > 0 && paid < fee) {
          paymentStatus = 'Partial';
        } else {
          paymentStatus = 'Unpaid';
        }
      }
      
      // Map member name helper
      var memberNameMap = {
        '004': 'Joshua Villafuerte',
        '005': 'Kent Bryan Lontok',
        '006': 'CE Box',
        '007': 'Charlene Stephanie Hilvano',
        '008': 'Jenelle Mangubat'
      };
      
      // Read member profile custom avatars stored in Google Cloud PropertiesService
      var props = PropertiesService.getScriptProperties();
      var savedAvatar = props.getProperty('AVATAR_' + eliteCode);

      var rowUniqueId = respondentId || ('GS-ROW-' + (i + 1));

      records.push({
        id: rowUniqueId,
        rowId: rowUniqueId,
        respondentId: respondentId,
        colB: colB,
        eliteCode: eliteCode,
        referrerId: eliteCode,
        referrerName: memberNameMap[eliteCode] || ('Elite Member ' + eliteCode),
        participantName: participantName || ('Participant ' + (i + 1)),
        inviteName: participantName || ('Participant ' + (i + 1)),
        duplicateChecker: duplicateChecker || 'N/A',
        schoolCompany: schoolCompany,
        trainingType: courseChoice + ' SO2',
        investmentFee: fee,
        paymentMade: paid,
        balance: balance,
        paymentStatus: paymentStatus,
        colG: dateSubmitted,
        enrollmentStatus: enrollmentStatus,
        verificationStatus: paymentStatus === 'Fully Paid' ? 'Verified' : 'Pending',
        isReferred: true,
        unitsEarned: Number((paid / 4500).toFixed(2)),
        avatar: savedAvatar || null,
        dateSubmitted: dateSubmitted
      });
    }

    // Collect all stored profile avatars
    var props = PropertiesService.getScriptProperties();
    var allProps = props.getProperties();
    var profilesMap = {};
    for (var key in allProps) {
      if (key.indexOf('AVATAR_') === 0) {
        var memberKey = key.replace('AVATAR_', '');
        profilesMap[memberKey] = allProps[key];
      }
    }
    
    var output = JSON.stringify({
      status: 'success',
      count: records.length,
      timestamp: new Date().toISOString(),
      data: records,
      profiles: profilesMap
    });
    
    return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    var errOutput = JSON.stringify({
      status: 'error',
      message: error.toString()
    });
    return ContentService.createTextOutput(errOutput).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle POST requests (Profile updates, Payment updates, etc.)
 */
function doPost(e) {
  try {
    var postData = JSON.parse(e.postData.contents);
    var props = PropertiesService.getScriptProperties();
    var action = postData.action || postData.type;
    var payload = postData.payload || postData;
    
    // 1. Profile Avatar updates across devices
    if (action === 'update_profile' || action === 'member') {
      var memberId = payload.id || payload.role;
      if (memberId && payload.avatar) {
        props.setProperty('AVATAR_' + memberId, payload.avatar);
      }
      var response = JSON.stringify({ status: 'success', message: 'Profile updated successfully' });
      return ContentService.createTextOutput(response).setMimeType(ContentService.MimeType.JSON);
    } 
    
    // 2. Two-Way Payment Updates: Dashboard -> Google Sheets
    if (action === 'update_payment') {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName("Form Responses 1") || ss.getSheetByName("Form Responses") || ss.getSheetByName("Sheet1") || ss.getSheetByName("Responses") || ss.getActiveSheet();
      
      if (!sheet) {
        throw new Error("Form Responses sheet not found.");
      }

      var data = sheet.getDataRange().getValues();
      var targetRowIndex = -1;
      
      var searchRespId = String(payload.respondentId || payload.colB || payload.id || '').trim();
      var searchRowId = String(payload.rowId || payload.id || '').trim();
      
      // Try extracting row index if format is "GS-ROW-{rowNum}" or "GS-R{rowNum}"
      if (searchRowId.indexOf('GS-ROW-') === 0 || searchRowId.indexOf('GS-R') === 0) {
        var cleanRow = searchRowId.replace('GS-ROW-', '').replace('GS-R', '').split('-')[0];
        var extractedRow = parseInt(cleanRow, 10);
        if (!isNaN(extractedRow) && extractedRow >= 2 && extractedRow <= data.length) {
          targetRowIndex = extractedRow;
        }
      }

      // Fallback search by matching Column B (Submission ID / Respondent ID)
      if (targetRowIndex === -1 && searchRespId) {
        for (var r = 1; r < data.length; r++) {
          var colBVal = String(data[r][1] || '').trim();
          if (colBVal === searchRespId) {
            targetRowIndex = r + 1; // 1-based row index in Google Sheets
            break;
          }
        }
      }

      if (targetRowIndex > 1) {
        var rowData = data[targetRowIndex - 1]; // 0-based array index
        var courseChoiceRaw = String(rowData[18] || rowData[17] || payload.trainingType || '').trim().toUpperCase();
        var isCOSH = courseChoiceRaw.indexOf('COSH') !== -1;
        
        var fee = Number(payload.investmentFee) || (isCOSH ? (Number(rowData[21] || rowData[20]) || 5000) : (Number(rowData[26] || rowData[24]) || 4500));
        var paid = Number(payload.paymentMade) || 0;
        var balance = Math.max(0, fee - paid);
        
        var paymentStatus = payload.paymentStatus || '';
        if (!paymentStatus) {
          if (balance === 0 && paid > 0) paymentStatus = 'Fully Paid';
          else if (paid > 0) paymentStatus = 'Partial';
          else paymentStatus = 'Unpaid';
        }

        if (isCOSH) {
          // Column V (Index 21 / Col 22): COSH Fee
          // Column W (Index 22 / Col 23): COSH Paid
          // Column X (Index 23 / Col 24): COSH Balance
          sheet.getRange(targetRowIndex, 22).setValue(fee);
          sheet.getRange(targetRowIndex, 23).setValue(paid);
          sheet.getRange(targetRowIndex, 24).setValue(balance);
        } else {
          // Column AA (Index 26 / Col 27): BOSH Fee
          // Column AB (Index 27 / Col 28): BOSH Paid
          // Column AC (Index 28 / Col 29): BOSH Balance
          sheet.getRange(targetRowIndex, 27).setValue(fee);
          sheet.getRange(targetRowIndex, 28).setValue(paid);
          sheet.getRange(targetRowIndex, 29).setValue(balance);
        }
        
        // Column AF (Index 31 / Col 32): Payment Status
        sheet.getRange(targetRowIndex, 32).setValue(paymentStatus);
        
        SpreadsheetApp.flush();
        var responseSuccess = JSON.stringify({ status: 'success', message: 'Payment updated in Google Sheets', rowIndex: targetRowIndex });
        return ContentService.createTextOutput(responseSuccess).setMimeType(ContentService.MimeType.JSON);
      } else {
        throw new Error("Target row not found for ID: " + searchRespId);
      }
    }

    var defaultResponse = JSON.stringify({ status: 'success', message: 'Request processed' });
    return ContentService.createTextOutput(defaultResponse).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    var errResponse = JSON.stringify({ status: 'error', message: err.toString() });
    return ContentService.createTextOutput(errResponse).setMimeType(ContentService.MimeType.JSON);
  }
}
