/*
 * Zotero AI Abstracts Script
 *
 * This script generates abstracts for Zotero items that have PDF attachments but no abstract.
 * It uses an AI API (such as OpenAI) to process the content and create summaries.
 *
 * Installation & Setup:
 * 1. Open Zotero.
 * 2. Go to Tools > Developer > Run JavaScript.
 * 3. Copy and paste this script into the console.
 * 4. Run the script.
 * 5. On the first run, you will be prompted to enter:
 *    - Your OpenAI API key (get one at https://platform.openai.com/api-keys)
 *    - The API endpoint (default: https://api.openai.com/v1/chat/completions)
 *    - Your preferred AI model (default: gpt-4o-mini-2024-07-18)
 * 6. These settings are stored in Zotero preferences, so you only need to enter them once.
 *
 * Usage:
 * - Select one or more Zotero items that have PDF attachments but no abstracts.
 * - Run this script from the Developer Console.
 * - The script will process the PDFs, send them to the AI model, and store the generated abstracts.
 * - Abstracts are saved in the "abstractNote" field of each Zotero item.
 *
 * Customization:
 * - You can change the stored preferences via Tools > Preferences > Advanced > Config Editor.
 * - Search for "extensions.zotero.abstractGen" to modify API settings.
 *
 * Troubleshooting:
 * - If no abstracts are generated, ensure PDFs contain selectable text.
 * - If you see an API error, verify your API key, endpoint, and model name.
 */
// Helper function to get stored preferences or prompt the user
function getPreference(prefName, promptMessage, defaultValue) {
    let value = Zotero.Prefs.get(`extensions.zotero.abstractGen.${prefName}`);
    if (!value) {
        value = prompt(promptMessage, defaultValue);
        if (value) {
            Zotero.Prefs.set(`extensions.zotero.abstractGen.${prefName}`, value);
            Zotero.debug(`${prefName} saved to preferences: ${value}`);
        } else {
            throw new Error(`${prefName} is required to run this script.`);
        }
    }
    return value;
}

// Helper function to call the AI API
async function generateAbstract(text) {
    const OPENAI_API_KEY = getPreference("apiKey", "Please enter your OpenAI API Key:", "");
    const API_ENDPOINT = getPreference("apiEndpoint", "Please enter your AI provider's endpoint:", "https://api.openai.com/v1/chat/completions");
    const AI_MODEL = getPreference("aiModel", "Please enter your preferred AI model:", "gpt-4o-mini-2024-07-18");

    try {
        const response = await fetch(API_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: AI_MODEL,
                messages: [
                    {
                        role: "system",
                        content: "You are an AI assistant that writes detailed abstracts for academic content."
                    },
                    {
                        role: "user",
                        content: `Write a detailed abstract for the following content:\n\n${text}`
                    }
                ],
                max_tokens: 1000
            }),
        });

        if (!response.ok) {
            const errorDetails = await response.text();
            throw new Error(`OpenAI API error: ${response.statusText} - ${errorDetails}`);
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    } catch (error) {
        Zotero.debug(`Error during AI API call: ${error.message}`);
        throw error;
    }
}

// Utility function to add a delay (for rate-limiting)
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Main function to process selected Zotero items
(async function () {
    const selectedItems = Zotero.getActiveZoteroPane().getSelectedItems();

    for (const item of selectedItems) {
        if (!item.isRegularItem()) continue;

        const attachments = item.getAttachments();
        if (attachments.length === 0) continue;

        const abstractNote = item.getField("abstractNote");
        if (abstractNote) continue;

        for (const attachmentId of attachments) {
            const attachment = Zotero.Items.get(attachmentId);

            if (attachment.attachmentContentType !== 'application/pdf') {
                Zotero.debug(`Skipping unsupported attachment type: ${attachment.attachmentContentType}`);
                continue;
            }

            let fileText;
            try {
                fileText = await attachment.attachmentText;
                if (!fileText) {
                    Zotero.debug(`No text content found in attachment: ${attachment.getField("title")}`);
                    continue;
                }
            } catch (error) {
                Zotero.debug(`Error accessing text content for attachment: ${attachment.getField("title")}`);
                continue;
            }

            let generatedAbstract;
            try {
                generatedAbstract = await generateAbstract(fileText);
            } catch (error) {
                Zotero.debug(`AI API error: ${error.message}`);
                continue;
            }

            try {
                item.setField("abstractNote", generatedAbstract);
                await item.saveTx();
                Zotero.debug(`Abstract added for item: ${item.getField("title")}`);
            } catch (error) {
                Zotero.debug(`Error saving abstract to item: ${error.message}`);
            }

            await sleep(1000);
            break;
        }
    }

    Zotero.debug("Abstract generation process completed.");
})();
