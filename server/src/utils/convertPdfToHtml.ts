// server/src/utils/convertPdfToHtml.ts
import { execFile } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

/**
 * PDF のバッファを受け取り、指定された outputHtmlPath に変換後 HTML を出力する。
 * Docker 経由で pdf2htmlEX を実行し、変換結果の HTML を読み込んで返す。
 *
 * @param pdfBuffer 変換元 PDF のバッファ
 * @param outputHtmlPath 一時的に変換結果を保存するパス
 * @returns 変換後の HTML 文字列
 */
export const convertPdfToHtml = async (pdfBuffer: Buffer, outputHtmlPath: string): Promise<string> => {
  // 一時ディレクトリに PDF を保存する
  const tmpDir = os.tmpdir();
  const pdfTempPath = path.join(tmpDir, `temp_${Date.now()}.pdf`);
  await fs.writeFile(pdfTempPath, pdfBuffer);

  try {
    // Docker を使用して pdf2htmlEX を実行する
    // ※ Docker イメージ 'bwits/pdf2htmlex' を使用（必要に応じて代替イメージに変更）
    await execFileAsync('docker', [
      'run', '--rm',
      '-v', `${tmpDir}:/pdf`,
      'bwits/pdf2htmlex',
      'pdf2htmlEX',
      `/pdf/${path.basename(pdfTempPath)}`,
      `/pdf/${path.basename(outputHtmlPath)}`
    ]);
    
    // 変換後の HTML ファイルを読み込む
    const htmlBuffer = await fs.readFile(outputHtmlPath);
    return htmlBuffer.toString();
  } catch (error) {
    console.error('PDF 変換エラー:', error);
    throw error;
  } finally {
    // 一時ファイルの削除（エラーがあっても無視）
    await fs.unlink(pdfTempPath).catch(() => {});
  }
};
