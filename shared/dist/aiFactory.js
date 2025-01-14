"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const deepseekService_1 = __importDefault(require("./deepseekService"));
const googleSpeechService_1 = __importDefault(require("./googleSpeechService"));
const googleTextToSpeechService_1 = __importDefault(require("./googleTextToSpeechService"));
class AIFactory {
    static getAIService() {
        return new deepseekService_1.default();
    }
    static getSpeechToTextService() {
        return new googleSpeechService_1.default();
    }
    static getTextToSpeechService() {
        return new googleTextToSpeechService_1.default();
    }
}
exports.default = AIFactory;
