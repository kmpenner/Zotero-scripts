// Function to get (or prompt for) the OpenAI API Key from Zotero preferences.
function getApiKey() {
    let apiKey = Zotero.Prefs.get("extensions.zotero.abstractGen.apiKey");
    if (!apiKey) {
        apiKey = prompt("Please enter your OpenAI API Key:");
        if (apiKey) {
            Zotero.Prefs.set("extensions.zotero.abstractGen.apiKey", apiKey);
            Zotero.debug("API Key saved to preferences.");
        } else {
            throw new Error("OpenAI API Key is required to run this script.");
        }
    }
    return apiKey;
}

(async function() {
  // Get the selected Zotero items.
  let items = Zotero.getActiveZoteroPane().getSelectedItems();
  if (!items.length) {
    Zotero.debug("No items selected.");
    return;
  }

  const OPENAI_API_KEY = getApiKey();
  const apiUrl = "https://api.openai.com/v1/chat/completions"; // Chat-based endpoint

  // List of allowed tags.
  const allowedTags = `Bibliography
Introductions
General studies and handbooks
Collections
State of Scholarship
Personalia
Significance
Digital Tools

Editions
Commentaries
Commentaries-Studies on
Translations
Translations-Studies on
History and Origin of LXX
Aristeas
Aristeas-translations
Aristeas-studies
Theology & Interpretation
Theology & Interpretation-Topical Studies in the LXX
Theology & Interpretation-Biblical Theology and Theology of the LXX
Theology & Interpretation-LXX Hermeneutics
Theology & Interpretation-Intertextuality and the LXX
Inspiration
Canon
Language
Language-general
Language-Grammars
Language-Grammatical studies
Language-Lexica
Language-Concordances
Language-Lexical studies
Language-Lexical studies-NT
Language-Influence of LXX language
Translation Studies-general
Translation Studies-biblical
Translation Studies-technique
God Humanized
Names-Divine
Names-Proper
Names-Onomastica
Transliterations
Wutz's theory


Textual Criticism
Hebrew Bible
DSS
DSS-general
DSS-specific
Pseudepigrapha
Targums
Peshitta
Rabbinic Literature
NT
NT- general
NT-specific
NT-testimonia
Hellenistic exegesis
Philo
Josephus
Witnesses
Witnesses-general
Witnesses-papyri
Witnesses-manuscripts
Witnesses-inscriptions
Witnesses-Catenae
Transmission
Later history
Later history-reception
Later history-chronology
Lectionaries
Revisions
Revisions-general

Revisions-Theodotion
Revisions-Aquila
Revisions-Symmachus
Revisions-Quinta
Revisions-Samaritikon
Revisions-Syros
Revisions-others
Revisions-Medieval Greek
Revisions-Graecus Venetus
Patristics

Textual Studies
Textual Studies-General
Textual Studies-Corruptions
Textual Studies-Recensions
Textual Studies-Hebraising Recensions
Textual Studies-Origen
Textual Studies-Hexaplaric Recension
Textual Studies-Hexapla

Textual Studies-Tetrapla
Textual Studies-Second Column
Textual Studies-Lucianic Recension
Textual Studies-Hesychian Recension
Jerome
Books
Books-Pentateuch
Books-Pentateuch-Genesis
Books-Pentateuch-Exodus
Books-Pentateuch-Leviticus
Books-Pentateuch-Numbers
Books-Pentateuch-Deuteronomy
Books-Historical Books
Books-Historical Books-Joshua
Books-Historical Books-Judges
Books-Historical Books-Ruth
Books-Historical Books-Kingdoms
Books-Historical Books-Kingdoms-general
Books-Historical Books-Kingdoms-1 & 2
Books-Historical Books-Kingdoms-3 & 4
Books-Historical Books-Paraleipomena
Books-Historical Books-Esdras
Books-Historical Books-Esther
Books-Historical Books-Judith
Books-Historical Books-Tobit
Books-Historical Books-Maccabees
Books-Historical Books-Maccabees-general
Books-Historical Books-Maccabees-1
Books-Historical Books-Maccabees-2
Books-Historical Books-Maccabees-3
Books-Historical Books-Maccabees-4
Books-Poetic-Psalms
Books-Poetic-Odes & Psalm 151
Books-Poetic-Proverbs
Books-Poetic-Ecclesiastes
Books-Poetic-Canticle
Books-Poetic-Job
Books-Poetic-Wisdom of Solomon
Books-Poetic-Sirach
Books-Poetic-Psalms of Solomon
Books-Prophets
Books-Prophets-Dodekaprophetai
Books-Prophets-Dodekaprophetai-Hosea
Books-Prophets-Dodekaprophetai-Amos
Books-Prophets-Dodekaprophetai-Micah
Books-Prophets-Dodekaprophetai-Joel
Books-Prophets-Dodekaprophetai-Obadiah
Books-Prophets-Dodekaprophetai-Jonah
Books-Prophets-Dodekaprophetai-Nahum
Books-Prophets-Dodekaprophetai-Habakkuk
Books-Prophets-Dodekaprophetai-Zephaniah
Books-Prophets-Dodekaprophetai-Haggai
Books-Prophets-Dodekaprophetai-Zechariah
Books-Prophets-Dodekaprophetai-Malachi
Books-Prophets-Isaiah
Books-Prophets-Jeremiah
Books-Prophets-Lamentations
Books-Prophets-Baruch
Books-Prophets-Ezekiel
Books-Prophets-Daniel
Versions
Versions-general
Versions-arabic
Versions-armenian
Versions-coptic
Versions-ethiopic
Versions-georgian
Versions-gothic
Versions-latin
Versions-slavonic
Versions-syriac
Versions-syro-hexapla
Versions-Jacob of Edessa

Illustration of the LXX`;

  // Process each selected item.
  for (let item of items) {
    // Retrieve the title and abstract.
    let title = item.getField("title") || "";
    let abstractNote = item.getField("abstractNote") || "";
    let text = (title + "\n\n" + abstractNote).trim();
    if (!text) {
      Zotero.debug("Item skipped: no title or abstract.");
      continue;
    }

    // Build a prompt instructing the assistant to return a JSON array within a markdown code block.
    // Each tag in the array must be prefixed with "Bib:".
    let prompt = `Given the following text extracted from a bibliographic item:

---------------------
${text}
---------------------

Return only a JSON array containing the appropriate subject tags that best reflect the subject matter of the item.
Each tag must be one of the following allowed tags but with "Bib:" prepended to it.
Allowed tags:
${allowedTags}

Format your reply as a markdown code block with valid JSON.`;

    try {
      // Call the OpenAI API.
      const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
              model: "gpt-4o-mini-2024-07-18", // Full model name with version
              messages: [
                  {
                      role: "system",
                      content: "You are an assistant that classifies bibliographic items into subject tags."
                  },
                  {
                      role: "user",
                      content: prompt
                  }
              ],
              max_tokens: 1000 // Adjust as needed
          }),
      });

      if (!response.ok) {
          const errorDetails = await response.text();
          throw new Error(`OpenAI API error: ${response.statusText} - ${errorDetails}`);
      }

      const data = await response.json();
      let content = data.choices[0].message.content.trim();
      Zotero.debug("Raw API response: " + content);

      // Extract JSON from markdown code fences.
      // This regex captures content between triple backticks (optionally with "json").
      const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
      const match = codeBlockRegex.exec(content);
      if (match && match[1]) {
        content = match[1].trim();
      } else {
        Zotero.debug("No markdown code block found; using full content.");
      }
      Zotero.debug("Extracted JSON content: " + content);

      // Parse the extracted content.
      let tags;
      try {
          tags = JSON.parse(content);
      } catch (parseError) {
          Zotero.debug("Failed to parse JSON from OpenAI response: " + parseError);
          continue;
      }

      if (!Array.isArray(tags)) {
          Zotero.debug("OpenAI response is not a JSON array.");
          continue;
      }

      // Add the returned tags to the Zotero item.
      tags.forEach(tag => item.addTag(tag));
      item.save();
      Zotero.debug("Tags added to item: " + title);
    } catch (error) {
      Zotero.debug("Error during OpenAI API call: " + error.message);
    }
  }

  Zotero.debug("Subject tags added based on AI classification.");
})();
