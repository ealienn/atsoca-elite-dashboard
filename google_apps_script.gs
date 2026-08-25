/**
 * ==============================================================================
 * ATSOCA ELITE DASHBOARD - GOOGLE APPS SCRIPT BACKEND ENDPOINT
 * ==============================================================================
 * 
 * Instructions:
 * 1. Open your Google Sheet connected to your Google Form.
 * 2. Navigate to Extensions > Apps Script.
 * 3. Replace the script editor contents with this code.
 * 4. Save and click "Deploy" > "New Deployment".
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
      
      // Column H (Index 7): 'code' column in Google Sheets
      var colB = String(row[1] || '').trim();
      var colH = String(row[7] || '').trim();
      var colD = String(row[3] || '').trim();
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
        var textTarget = (colH + ' ' + colB + ' ' + colD).toLowerCase();
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

      // Column M: Participant Name (Index 12)
      var participantName = String(row[12] || row[8] || row[11] || row[13] || '').trim() || ('Participant ' + i);
      
      // Column O: School / Company (Index 14)
      var schoolCompany = String(row[14] || row[10] || row[13] || row[15] || '').trim() || 'N/A';
      
      // Column R: Course / Program ('COSH' or 'BOSH') (Index 17)
      var courseChoiceRaw = String(row[17] || '').trim().toUpperCase();
      var courseChoice = courseChoiceRaw.indexOf('COSH') !== -1 ? 'COSH' : 'BOSH';
      
      var fee = 0;
      var paid = 0;
      var balance = 0;
      
      if (courseChoice === 'COSH') {
        // Column U: COSH Training Fee (Index 20)
        // Column V: COSH Amount Paid (Index 21)
        // Column W: COSH Remaining Balance (Index 22)
        fee = Number(row[20]) || 5000;
        paid = Number(row[21]) || 0;
        balance = (row[22] !== undefined && row[22] !== '' && !isNaN(row[22])) ? Number(row[22]) : Math.max(0, fee - paid);
      } else {
        // Column Y: BOSH Training Fee (Index 24)
        // Column Z: BOSH Amount Paid (Index 25)
        // Column AA: BOSH Remaining Balance (Index 26)
        fee = Number(row[24]) || 4500;
        paid = Number(row[25]) || 0;
        balance = (row[26] !== undefined && row[26] !== '' && !isNaN(row[26])) ? Number(row[26]) : Math.max(0, fee - paid);
      }
      
      // Column AC: Payment Status (Index 28)
      var colAC = String(row[28] || '').trim();
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
        // Automatic Formula Calculation when Column AC is empty
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

      records.push({
        id: 'GS-R' + (i + 1) + '-' + (respondentId || 'ID'),
        rowId: 'GS-R' + (i + 1) + '-' + (respondentId || 'ID'),
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
 * Handle POST requests to update member profile photos across devices
 */
function doPost(e) {
  try {
    var postData = JSON.parse(e.postData.contents);
    var props = PropertiesService.getScriptProperties();
    
    if (postData.action === 'update_profile' || postData.type === 'member') {
      var payload = postData.payload || postData;
      var memberId = payload.id || payload.role;
      if (memberId && payload.avatar) {
        props.setProperty('AVATAR_' + memberId, payload.avatar);
      }
    }
    
    var response = JSON.stringify({ status: 'success', message: 'Profile updated successfully' });
    return ContentService.createTextOutput(response).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    var errResponse = JSON.stringify({ status: 'error', message: err.toString() });
    return ContentService.createTextOutput(errResponse).setMimeType(ContentService.MimeType.JSON);
  }
}
