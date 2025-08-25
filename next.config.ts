import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["prosemirror-model"],

  webpack(config, { dev }) {
    // 添加别名来解析本地源代码
    if (!config.resolve.alias) {
      config.resolve.alias = {};
    }

    config.resolve.alias = {
      ...config.resolve.alias,
      "prosemirror-model": path.resolve(
        __dirname,
        "../prosemirror/prosemirror-model/src"
      ),
    };

    // 添加对 .markdown 文件的支持
    config.module.rules.push({
      test: /\.markdown$/,
      use: "raw-loader",
    });

    // 开发模式下启用源映射和文件监听
    if (dev) {
      config.devtool = "eval-source-map";

      // 监听外部文件变化
      config.watchOptions = {
        ...config.watchOptions,
        ignored: "**/node_modules/**",
        poll: 1000,
      };
    }

    return config;
  },

  experimental: {
    externalDir: true,
  },
};

export default nextConfig;
