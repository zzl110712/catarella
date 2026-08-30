export default {
  compress: {
    // 扫描时认作图片的扩展名（统一小写）
    extensions: ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tiff', '.gif', '.heic', '.heif', '.svg'],
    // 扫描时要跳过的目录名：.backup 是本工具自己的备份目录，绝不能被再压缩一遍
    ignoreDirs: ['.backup'],
    // 并发数：sharp 的编解码跑在 libuv 线程池（默认 4 线程）所以并发数量也控制在 4
    defaultConcurrency: 4
  }
}