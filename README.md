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

Would you like any refinements or additional sections (e.g., API provider alternatives, screenshots)?
