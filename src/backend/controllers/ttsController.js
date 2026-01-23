import catchAsyncErrors from "@/backend/middlewares/catchAsyncErrors";
import { getVoicesFromElevenLabs } from "../modules/tts/getVoices";

// Get TTS voices => /api/tts/voices
const getTTSVoices = catchAsyncErrors(async (req, res) => {
	const voices = await getVoicesFromElevenLabs();

	res.status(200).json({
		success: true,
		voices,
	});
});

export { getTTSVoices };
