import sharp, { type Sharp } from 'sharp'
import path from 'path'
import { randomUUID } from 'crypto'
import { readFile, rename, unlink, writeFile } from 'fs/promises'
import { backupFile, replaceExt } from '#lib/utils/fs'

// 工具支持输出格式
const OUTPUT_FORMATS = ['jpeg', 'png', 'webp', 'avif', 'tiff', 'gif'] as const
export type OutputFormat = (typeof OUTPUT_FORMATS)[number]

// 只能作为输入的格式
const INPUT_ONLY_FORMATS = ['heif', 'svg'] as const
export type InputFormat = OutputFormat | (typeof INPUT_ONLY_FORMATS)[number]

// 【输出格式】写文件用的扩展名
const EXT_BY_FORMAT: Record<OutputFormat, string> = {
  jpeg: '.jpg',
  png: '.png',
  webp: '.webp',
  avif: '.avif',
  tiff: '.tiff',
  gif: '.gif'
}

// 只能解码的格式必须转出，设置默认转换目标
const FALLBACK_OUTPUT: Record<
  (typeof INPUT_ONLY_FORMATS)[number],
  OutputFormat
> = {
  heif: 'jpeg',
  svg: 'png'
}

// 扩展名和输入格式映射
const EXT_TO_INPUT_FORMAT: Record<string, InputFormat> = {
  ".jpg": "jpeg",
  ".jpeg": "jpeg",
  ".png": "png",
  ".webp": "webp",
  ".avif": "avif",
  ".tiff": "tiff",
  ".gif": "gif",
  ".heic": "heif",
  ".heif": "heif",
  ".svg": "svg",
}

/**
 * 压缩参数（CLI 选项与交互问答最终汇聚成这一个对象，传给每个文件）
 * quality 1-100；png 会映射成压缩等级（见 pngOptions）
 * format 指定输出格式；undefined = 尽量保持原格式
 * maxWidth 最大宽度 px；只缩小不放大
 * dry true = 真实编码计算大小，但不写任何文件
 */
export interface CompressParams {
  quality: number;
  format?: OutputFormat;
  maxWidth?: number;
  dry: boolean;
}

/**
 * 单个文件的处理结果（报告与终端汇总的数据来源）
 * file 输入文件绝对路径
 * output 输出文件路径（dry 时是"将会写入"的路径）
 * format 实际输出格式
 * beforeBytes 输入的时候文件大小
 * afterBytes 输出的时候文件大小 失败的时候是 0
 * status 
 * error failed 的时候的错误信息
 */
export interface FileResult {
  file: string;
  output: string;
  format: OutputFormat;
  beforeBytes: number;
  afterBytes: number;
  status: "done" | "skipped" | "failed";
  error?: string;
}

// 【类型守卫】将 string 类型收窄为 输出格式字面量类型
function isOutputFormat(f: string): f is OutputFormat {
  return (OUTPUT_FORMATS as readonly string[]).includes(f)
}

/**
 * png 是无损格式，没有 jpeg 那种"有损 quality"：
 *  把 quality 反向映射成 0-9 压缩等级（quality 越低，压得越狠、编码越慢）
 *  quality <= 60 时追加 palette（量化到最多 256 色），这是 png 唯一有效的"有损"手段
 * @param quality 压缩等级
 * @returns 压缩结果
 */
function pngOptions(quality: number): {
  compressionLevel: number;
  palette?: boolean;
} {
  const compressionLevel = Math.round(((100 - quality) / 100) * 9)
  return quality <= 60
    ? { compressionLevel, palette: true }
    : { compressionLevel }
}
