const voicesJson = require("./voices.json");

async function getVoicesFromElevenLabs() {
	try {
		return voicesJson.map((v) => ({
			preview_url: v.preview_url,
			voice_id: v.voice_id,
			name: v.name,
			labels: v.labels,
			description: v.description,
		}));
	} catch (error) {
		console.error("Error:", error);
		return [];
	}
}

module.exports = { getVoicesFromElevenLabs };
