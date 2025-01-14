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
// shared/services/googleSpeechService.ts
const speech_1 = require("@google-cloud/speech"); // 修正
class GoogleSpeechService {
    constructor() {
        this.client = new speech_1.SpeechClient();
    }
    transcribe(audioBuffer) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const audio = {
                content: audioBuffer.toString('base64'),
            };
            const config = {
                encoding: speech_1.protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.LINEAR16, // 修正
                languageCode: 'ja-JP',
            };
            const request = {
                audio,
                config,
            };
            const [response] = yield this.client.recognize(request);
            const transcription = (_a = response.results) === null || _a === void 0 ? void 0 : _a.map((result) => { var _a, _b; return (_b = (_a = result.alternatives) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.transcript; }).join('\n');
            return transcription || '';
        });
    }
}
exports.default = GoogleSpeechService;
