import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // transpilePackages: [
  //   "prosemirror-model",
  //   "prosemirror-schema-list",
  //   "prosemirror-schema-basic",
  //   "prosemirror-state",
  //   "prosemirror-view",
  //   "prosemirror-example-setup",
  // ],

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
      "prosemirror-schema-list": path.resolve(
        __dirname,
        "../prosemirror/prosemirror-schema-list/src"
      ),
      "prosemirror-schema-basic": path.resolve(
        __dirname,
        "../prosemirror/prosemirror-schema-basic/src"
      ),
      "prosemirror-state": path.resolve(
        __dirname,
        "../prosemirror/prosemirror-state/src"
      ),
      "prosemirror-view": path.resolve(
        __dirname,
        "../prosemirror/prosemirror-view/src"
      ),
      "prosemirror-example-setup": path.resolve(
        __dirname,
        "../prosemirror/prosemirror-example-setup/src"
      ),
      "prosemirror-markdown": path.resolve(
        __dirname,
        "../prosemirror/prosemirror-markdown/src"
      ),
    };

    // 添加一个规则来处理 .json 文件
    config.module.rules.push({
      test: /\.txt$/,
      use: "raw-loader", // 使用 raw-loader 来处理 .json 文件
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
