var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers';
import UnoCSS from 'unocss/vite';
import path from 'path';
import fs from 'fs';
import { fetch as undiciFetch, ProxyAgent } from 'undici';
import { execSync } from 'child_process';
function getSystemProxy() {
    if (process.env.https_proxy || process.env.http_proxy) {
        return process.env.https_proxy || process.env.http_proxy;
    }
    try {
        var out = execSync('scutil --proxy', { encoding: 'utf-8' });
        var portMatch = out.match(/HTTPPort\s*:\s*(\d+)/);
        var proxyMatch = out.match(/HTTPProxy\s*:\s*([^\s]+)/);
        var enabled = out.match(/HTTPEnable\s*:\s*1/);
        if (enabled && portMatch && proxyMatch) {
            return "http://".concat(proxyMatch[1], ":").concat(portMatch[1]);
        }
    }
    catch (_a) { }
    return 'http://127.0.0.1:17891';
}
var proxyUrl = getSystemProxy();
var dispatcher = proxyUrl ? new ProxyAgent(proxyUrl) : undefined;
function discourseProxyPlugin() {
    return {
        name: 'discourse-proxy-plugin',
        configureServer: function (server) {
            var _this = this;
            server.middlewares.use(function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
                var body_1, targetPath, targetUrl, response, lastErr, attempt, e_1, arrayBuffer, err_1;
                var _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            // Local persistence endpoint: writes synced data directly to public/data disk
                            if (req.url === '/api/save-local-sync' && req.method === 'POST') {
                                body_1 = '';
                                req.on('data', function (chunk) { body_1 += chunk; });
                                req.on('end', function () {
                                    try {
                                        var data = JSON.parse(body_1);
                                        var outputDir = path.resolve(__dirname, 'public/data');
                                        if (!fs.existsSync(outputDir))
                                            fs.mkdirSync(outputDir, { recursive: true });
                                        if (data.latest) {
                                            fs.writeFileSync(path.join(outputDir, 'latest.json'), JSON.stringify(data.latest, null, 2), 'utf-8');
                                        }
                                        if (data.categories) {
                                            fs.writeFileSync(path.join(outputDir, 'categories.json'), JSON.stringify(data.categories, null, 2), 'utf-8');
                                        }
                                        var meta = {
                                            lastSyncedAt: new Date().toISOString(),
                                            topicCount: data.topicCount || 0,
                                            categoryCount: data.categoryCount || 0,
                                            status: 'success'
                                        };
                                        fs.writeFileSync(path.join(outputDir, 'sync-meta.json'), JSON.stringify(meta, null, 2), 'utf-8');
                                        res.setHeader('Content-Type', 'application/json');
                                        res.end(JSON.stringify({ success: true, meta: meta }));
                                    }
                                    catch (err) {
                                        res.statusCode = 500;
                                        res.end(JSON.stringify({ error: err.message }));
                                    }
                                });
                                return [2 /*return*/];
                            }
                            if (!((_a = req.url) === null || _a === void 0 ? void 0 : _a.startsWith('/api/discourse'))) {
                                return [2 /*return*/, next()];
                            }
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 10, , 11]);
                            targetPath = req.url.replace(/^\/api\/discourse/, '');
                            targetUrl = "https://forum.godotengine.org".concat(targetPath);
                            response = void 0;
                            lastErr = void 0;
                            attempt = 0;
                            _b.label = 2;
                        case 2:
                            if (!(attempt < 3)) return [3 /*break*/, 8];
                            _b.label = 3;
                        case 3:
                            _b.trys.push([3, 5, , 7]);
                            return [4 /*yield*/, undiciFetch(targetUrl, {
                                    dispatcher: dispatcher,
                                    headers: {
                                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                                        'Accept': 'application/json'
                                    }
                                })];
                        case 4:
                            response = _b.sent();
                            if (response && response.status < 500) {
                                return [3 /*break*/, 8];
                            }
                            return [3 /*break*/, 7];
                        case 5:
                            e_1 = _b.sent();
                            lastErr = e_1;
                            return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 300); })];
                        case 6:
                            _b.sent();
                            return [3 /*break*/, 7];
                        case 7:
                            attempt++;
                            return [3 /*break*/, 2];
                        case 8:
                            if (!response && lastErr) {
                                throw lastErr;
                            }
                            res.statusCode = response.status;
                            response.headers.forEach(function (val, key) {
                                var lower = key.toLowerCase();
                                if (!['content-encoding', 'content-length', 'transfer-encoding', 'connection'].includes(lower)) {
                                    res.setHeader(key, val);
                                }
                            });
                            res.setHeader('Content-Type', 'application/json; charset=utf-8');
                            return [4 /*yield*/, response.arrayBuffer()];
                        case 9:
                            arrayBuffer = _b.sent();
                            res.end(Buffer.from(arrayBuffer));
                            return [3 /*break*/, 11];
                        case 10:
                            err_1 = _b.sent();
                            console.error('[Discourse Proxy Plugin Error]', err_1.message);
                            res.statusCode = 502;
                            res.setHeader('Content-Type', 'application/json; charset=utf-8');
                            res.end(JSON.stringify({ error: '502 Bad Gateway: ' + err_1.message }));
                            return [3 /*break*/, 11];
                        case 11: return [2 /*return*/];
                    }
                });
            }); });
        }
    };
}
// https://vitejs.dev/config/
export default defineConfig({
    base: './',
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    },
    plugins: [
        vue(),
        UnoCSS(),
        discourseProxyPlugin(),
        AutoImport({
            imports: [
                'vue',
                'vue-router',
                {
                    'naive-ui': [
                        'useDialog',
                        'useMessage',
                        'useNotification',
                        'useLoadingBar'
                    ]
                }
            ],
            dts: 'auto-imports.d.ts'
        }),
        Components({
            resolvers: [NaiveUiResolver()],
            dts: 'components.d.ts'
        })
    ],
    server: {
        port: 5173
    }
});
