cd 到该文件夹下，npm i 之后运行以下脚本可分别执行如下命令：

npm run unittest: 运行单元测试

npm run test: 依次运行eslint检查，打包压缩，单元测试

npm run start-w: 监视模式运行./example/index.js，如果index.js文件发生更改，会重新运行

npm run start: 运行./example/index.js

npm run watch: 监视模式运行src

npm run dev: 在development环境下打包src

npm run build: 在production环境下打包src，等于prepublish

其中，npm run start-w, npm run start 可以供测试人员编写测试代码。在运行这两个程序之前，需要先npm run dev/npm run watch/npm run build 一次，以获得打包后的dist代码。
