# SheetMatch 🔍
> **A Simple Tool to Match and Sort Records in Google Sheets**

**SheetMatch** helps you compare a new list of data in Google Sheets against older database sheets. It automatically finds who is new and who is already in your past records.

---

## 🎯 What Problem Does It Solve?

When you receive a new list of people (for example: job candidates, students, or customers), you often need to check: **"Did we already handle these people in our past sheets?"**

* **Without SheetMatch:** You have to search names or IDs one by one using `Ctrl + F` or write long formulas across many spreadsheets. This takes hours and leads to mistakes.
* **With SheetMatch:** You click one button. The script checks all your past sheets in seconds and splits your list automatically.

---

## 🚀 What Does It Do?

1. **Scans Your New List:** Reads the main sheet where your new data comes in.
2. **Checks Past Sheets:** Looks through all your old background spreadsheets.
3. **Creates 2 Simple Tabs:**
   * **`Already Processed`**: Contains people found in past databases (plus a note showing which file they came from).
   * **`New / Unprocessed`**: Contains brand-new people ready for your action.

> **Note:** Your original main sheet is never changed or edited.

---

## 💡 Real-Life Examples

* **Job Interviews:** Check if new job applicants were already interviewed in past months.
* **Student Admissions:** Check if new applicants applied in previous semesters.
* **Customer Support & Sales:** Check if new leads are already existing customers.
* **Events & Giveaways:** Check if new entries won past contests.

---

## 🛠️ How to Set Up (Step-by-Step)

Setting up SheetMatch takes less than 5 minutes. Follow these simple steps:

### Step 1: Open Apps Script
1. Open your main Google Sheet (the one with your new list).
2. Click **Extensions** in the top menu.
3. Select **Apps Script**.

### Step 2: Paste the Code
1. Delete any text already in the editor.
2. Copy all code from `Code.gs` and paste it inside the editor window.

### Step 3: Configure Your Settings
At the top of the code, find the `CONFIG` area and change the placeholder text:

1. **`mainSheetName`**: Type the exact name of the tab in your current sheet (e.g., `"Main Applications"`).
2. **`uniqueIdHeader`**: Type the column title used to check duplicates (e.g., `"Student ID"`, `"Email"`, or `"Phone"`).
3. **`databaseSources`**: Paste the web links (URLs) of your past Google Sheets and their tab names:

```javascript
const CONFIG = {
  mainSheetName: "Main Applications", 
  uniqueIdHeader: "Student ID",        

  alreadyProcessedSheetName: "Already Processed",
  newUnprocessedSheetName: "New / Unprocessed",

  databaseSources: [
    {
      spreadsheetUrl: "https://docs.google.com/spreadsheets/d/YOUR_FIRST_SHEET_ID/edit",
      sheetName: "Sheet1"
    },
    {
      spreadsheetUrl: "https://docs.google.com/spreadsheets/d/YOUR_SECOND_SHEET_ID/edit",
      sheetName: "Sheet1"
    }
  ]
};
```

### Step 4: Save and Run
1. Click the **Save icon** 💾 (or press `Ctrl + S`).
2. Select `runSheetMatch` from the function list at the top bar.
3. Click **Run**.
4. *(First time only)* Click **Review Permissions**, select your Google account, click **Advanced**, and then click **Go to SheetMatch (unsafe)** to allow Google Sheets access.

---

## 📄 License
This project is free to use under the [MIT License](LICENSE).
