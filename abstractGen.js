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
