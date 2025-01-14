"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// shared/services/googleTextToSpeechService.ts
const text_to_speech_1 = require("@google-cloud/text-to-speech"); // 修正
class GoogleTextToSpeechService {
    constructor() {
        this.client = new text_to_speech_1.TextToSpeechClient();
    }
    synthesize(text) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = {
                input: { text },
                voice: { languageCode: 'ja-JP', ssmlGender: 'NEUTRAL' },
                audioConfig: { audioEncoding: text_to_speech_1.protos.google.cloud.texttospeech.v1.AudioEncoding.MP3 }, // 修正
            };
            const [response] = yield this.client.synthesizeSpeech(request);
            return Buffer.from(response.audioContent || '');
        });
    }
}
exports.default = GoogleTextToSpeechService;
