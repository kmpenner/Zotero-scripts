# Zotero scripts
For added functionality in Zotero bibliography management app
 ## General instructions for any of the scripts
1. Paste the code from the script you want to run into Zotero through Tools->Developer->Run JavaScript
2. Click Run
---
## Zotero replace
 Search and replace functionality for Zotero
 ### Instructions
 - Change the first few lines as needed for your purposes

---
## Zotero AI Abstracts

This script enhances Zotero by automatically generating abstracts for selected items that:
- Have **PDF attachments**.
- Do **not** already have an abstract.

### Features
- Uses **AI-generated summaries** from your preferred AI provider.
- Works **seamlessly within Zotero** using the Developer Console.
- Stores **your API preferences** in Zotero to avoid re-entering them.

### Requirements
1. **An AI provider API key**  
   - Get one for free from [OpenAI](https://platform.openai.com/api-keys) or another AI provider.
2. **Zotero** (Desktop version)
3. **A stable internet connection** (for AI API requests)

### Installation
1. Open **Zotero**.
2. Go to **Tools > Developer > Run JavaScript**.
3. Copy and paste the script into the console.
4. Run the script.

### First-Time Setup
On the first run, Zotero will prompt you to enter:
- Your **AI provider's API key**.
- Your **API endpoint** (default: `https://api.openai.com/v1/chat/completions`).
- Your **preferred AI model** (default: `gpt-4o-mini-2024-07-18`).

These settings are **stored in Zotero's preferences**, so you only need to enter them once.

### Usage
1. **Select Zotero items** that have PDF attachments and no abstract.
2. **Run the script** from the Developer Console.
3. **Wait for abstracts to be generated and saved**.

### Customization
- You can change the **AI model** or **API provider** by modifying the stored Zotero preferences:
  - API Key: `extensions.zotero.abstractGen.apiKey`
  - API Endpoint: `extensions.zotero.abstractGen.apiEndpoint`
  - Model: `extensions.zotero.abstractGen.aiModel`
- To modify them, use:
  - **Tools > Preferences > Advanced > Config Editor** (Search for `abstractGen`)

### Troubleshooting
- **Error: "Bad Request - Missing Parameter"**
  - Ensure you selected a valid AI model and endpoint.
- **No abstracts generated**
  - Check that the PDF attachments contain selectable text.
- **Incorrect abstracts**
  - Try a different AI model (e.g., `gpt-4-turbo` for better quality).

---
# Set.js
This script is designed to facilitate batch editing of items in Zotero, a reference management software, using its JavaScript API. It allows users to modify a specific field (such as "creator") for multiple selected items in the Zotero library. Here's a detailed breakdown of the script:

### Purpose:
The script enables users to change a particular field's value (like the creator's name) for multiple selected items in Zotero, with the changes applied to each item in the selection. This is particularly useful for tasks such as correcting or standardizing author names, publication dates, or other metadata fields.

### How It Works:
1. **Backup Reminder**: 
   - It is recommended to back up the Zotero SQLite database (`zotero.sqlite`) before running the script. This is crucial for preventing data loss in case of errors.

2. **Field Selection**: 
   - The user is prompted to enter the name of the field to modify (e.g., "creator"). If the input is empty, the script will cancel the operation.

3. **Field Modification**:
   - Once a field name is provided, the script retrieves the value of that field from the selected Zotero items.
   - The user is then prompted to enter the new value for the selected field. If the value differs from the existing value, the change will be applied to all selected items.

4. **Field Handling**:
   - Special handling is included for the "creator" field, where the field's value is expected to be a JSON array representing the creators (e.g., authors). The script uses `JSON.stringify()` and `JSON.parse()` to handle the creator's data structure.
   - For other fields, it retrieves the current field value and applies the new one using `setField()` or `setCreators()`.

5. **Transaction Execution**:
   - Changes are wrapped in a `Zotero.DB.executeTransaction()` to ensure they are applied atomically. If an error occurs, the transaction will be rolled back.

6. **Final Output**:
   - The script outputs the number of items modified, letting the user know how many records were updated.

### Important Notes:
- The script uses regular expressions to match field names and should include appropriate syntax (e.g., quotes and colons for "firstName").
- The user should select the items in Zotero that need to be modified before running the script.
- The script only supports modifying one field at a time (e.g., "creator", "title", etc.).

### Example Use Case:
- A researcher may have incorrectly entered the name of an author for multiple items and now wants to correct it. By using this script, they can quickly find and replace the name of the author across all selected items.

### References:
- The script combines ideas from a post by Dan Stillman on Zotero's forums and a related discussion about find-and-replace functionality for Zotero items.

### Usage:
1. Open Zotero and select the items you want to modify.
2. Go to **Tools → Developer → Run JavaScript** in Zotero.
3. Paste the script into the JavaScript window and run it.
4. Follow the prompts to select the field and enter the new value.

This script provides a straightforward solution for batch editing metadata in Zotero, enhancing workflow efficiency for users dealing with large libraries of references.
---
