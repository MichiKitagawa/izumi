// shared/services/textFormatter.ts
export function formatText(rawText: string): string {
    // 例: 改行ごとに<p>タグで囲むシンプルな整形処理
    const paragraphs = rawText.split('\n').filter(line => line.trim() !== '');
    return paragraphs.map(p => `<p>${p.trim()}</p>`).join('');
  }
  