import { readdir, copyFile, mkdir, stat } from "fs/promises";
import { constants } from 'fs' // 文件系统常量集合 => 用于给各种文件操作 API 传递标志位
import path from 'path'
import config from '#config'

/**
 * 把字节数格式化成人类可读的大小
 * @param bytes - 文件的字节大小
 * @returns 可读字符串，1024 进制保留两位小数，如 '1.18 MB'
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(2)} KB`
  const mb = kb / 1024
  if (mb < 1024) return `${mb.toFixed(2)} MB`
  return `${(mb / 1024).toFixed(2)} GB`
}

/**
 * 节省百分比
 * @param before 压缩之前大小
 * @param after 压缩之后大小
 * @returns 压缩比例
 */
export function formatPercent(before: number, after: number): string {
  if (before <= 0) return '-'
  return `${((1 - after / before) * 100).toFixed(1)}%`
}

/**
 * 解析基准目录 备份位置、报告位置、相对路径展示全部要根据 root 为基准
 * @param target 当前目标路径
 * @returns { root: 基准目录路径, isFile: 是否是文件 }
 */
export async function resolveRoot(target: string): Promise<{ root: string, isFile: boolean }> {
  const s = await stat(target)
  return s.isFile()
    ? { root: path.dirname(target), isFile: true }
    : { root: target, isFile: false }
}

/**
 * 收集 root 下所有支持的图片文件
 * @param root 根目录
 * @param recursive 是否递归目录下所有文件
 * @returns 
 */
export async function collectImages(root: string, recursive: boolean): Promise<string[]> {
  /**
   * withFileTypes 必须是字面量类型（true）不能是抽象类型（boolean）
   * withFileTypes的作用 => 返回 Dirent 对象数组，每项自带类型信息和判断方法
   */
  const dirents = await readdir(root, { withFileTypes: true, recursive })
  const files: string[] = []
  for (const d of dirents) {
    if (!d.isFile()) continue

    const full = path.join(d.parentPath, d.name)
    const ext = path.extname(d.name).toLowerCase() // extname => 获取后缀名
    // 如果 sharp 不能处理的文件类型 => 直接跳过
    if (!config.compress.extensions.includes(ext)) continue

    if (recursive) {
      // 计算 full 路径相对于 root 的相对路径，再用系统路径分隔符拆分路径为数组
      const segments = path.relative(root, full).split(path.sep)
      // 跳过 ignoreDirs 下的所有文件
      if (segments.some(seg => config.compress.ignoreDirs.includes(seg))) continue
    }
    files.push(full)
  }
  return files.sort()
}

/**
 * 备份路径规则：root/.backup/<文件相对 root 的路径>
 * @param root 根目录
 * @param file 目标文件目录
 * @returns 备份文件路径
 */
export function backupPathFor(root: string, file: string): string {
  return path.join(root, '.backup', path.relative(root, file))
}

/**
 * 备份单个文件，返回是否真的执行了复制
 * @param root 根目录
 * @param file 需要复制的文件
 * @returns 是否真的复制了目标文件
 */
export async function backupFile(root: string, file: string): Promise<boolean> {
  const dest = backupPathFor(root, file)
  await mkdir(path.dirname(dest), { recursive: true })

  try {
    await copyFile(root, dest, constants.COPYFILE_EXCL)
    return true
  } catch (err) {
    // Error EXISTs，文件/目录已存在
    if (err instanceof Error && (err as NodeJS.ErrnoException).code === 'EEXIST') return false
    throw err
  }
}

/**
 * 换扩展名：格式转换时生成输出文件名 a.jpg -> a.webp
 * @param file 源文件
 * @param newExt 新后缀名
 * @returns 返回替换文件名的后缀路径
 */
export function replaceExt(file: string, newExt: string): string {
  const base = path.basename(file, path.extname(file))
  return path.join(path.dirname(file), base + newExt)
}
