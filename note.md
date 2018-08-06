# 笔记：

1. 借助 supervisor 模块，对项目进行热重启
2. range 范围请求
   rang: bytes = [start] - [end]
   Accept-Ranges: bytes
   Content-Range: bytes start-end/total
3. 缓存 header
   Expires, Cache-Control
   If-Modified-Since / Last-Modified
   If-None-Match / ETag

版本号：
x.y.z

1. 修复 bug，升 z 位
2. 新增功能并兼容之前的功能， 升 y 位
3. 大版本升级，不一定保证旧版本兼容，升 x 位

比如：1.2.*，z 位会自动升级到最新的，(~1.2.0 === 1.2.*)
比如：2.x，y 位会自动升级到最新的，(^2.0.0 === 2.x)
比如：* 就表示任意版本，会自动升级 z 为最新版
