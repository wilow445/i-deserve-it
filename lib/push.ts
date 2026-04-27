12:10:21.808 Running build in Washington, D.C., USA (East) – iad1
12:10:21.808 Build machine configuration: 2 cores, 8 GB
12:10:21.927 Cloning github.com/wilow445/i-deserve-it (Branch: main, Commit: 92e1c12)
12:10:21.928 Previous build caches not available.
12:10:22.142 Cloning completed: 215.000ms
12:10:22.431 Running "vercel build"
12:10:23.159 Vercel CLI 51.6.1
12:10:23.441 Installing dependencies...
12:10:43.597 npm warn deprecated next@15.0.3: This version has a security vulnerability. Please upgrade to a patched version. See https://nextjs.org/blog/CVE-2025-66478 for more details.
12:10:43.806 
12:10:43.806 added 185 packages in 20s
12:10:43.807 
12:10:43.807 29 packages are looking for funding
12:10:43.807   run `npm fund` for details
12:10:43.874 Detected Next.js version: 15.0.3
12:10:43.880 Running "npm run build"
12:10:43.986 
12:10:43.987 > i-deserve-it@1.0.0 build
12:10:43.987 > next build
12:10:43.987 
12:10:44.737 Attention: Next.js now collects completely anonymous telemetry regarding usage.
12:10:44.738 This information is used to shape Next.js' roadmap and prioritize features.
12:10:44.738 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
12:10:44.738 https://nextjs.org/telemetry
12:10:44.739 
12:10:44.819    ▲ Next.js 15.0.3
12:10:44.820 
12:10:44.837    Creating an optimized production build ...
12:10:57.693 <w> [webpack.cache.PackFileCacheStrategy] Serializing big strings (216kiB) impacts deserialization performance (consider using Buffer instead and decode when needed)
12:11:06.395  ✓ Compiled successfully
12:11:06.401    Linting and checking validity of types ...
12:11:10.725 Failed to compile.
12:11:10.725 
12:11:10.725 ./lib/push.ts:53:7
12:11:10.726 Type error: Type 'Uint8Array<ArrayBufferLike>' is not assignable to type 'string | BufferSource | null | undefined'.
12:11:10.726   Type 'Uint8Array<ArrayBufferLike>' is not assignable to type 'ArrayBufferView<ArrayBuffer>'.
12:11:10.726     Types of property 'buffer' are incompatible.
12:11:10.726       Type 'ArrayBufferLike' is not assignable to type 'ArrayBuffer'.
12:11:10.726         Type 'SharedArrayBuffer' is missing the following properties from type 'ArrayBuffer': resizable, resize, detached, transfer, transferToFixedLength
12:11:10.726 
12:11:10.727 [0m [90m 51 |[39m     sub [33m=[39m [36mawait[39m reg[33m.[39mpushManager[33m.[39msubscribe({[0m
12:11:10.727 [0m [90m 52 |[39m       userVisibleOnly[33m:[39m [36mtrue[39m[33m,[39m[0m
12:11:10.727 [0m[31m[1m>[22m[39m[90m 53 |[39m       applicationServerKey[33m:[39m urlBase64ToUint8Array(process[33m.[39menv[33m.[39m[33mNEXT_PUBLIC_VAPID_PUBLIC_KEY[39m[33m![39m)[33m,[39m[0m
12:11:10.727 [0m [90m    |[39m       [31m[1m^[22m[39m[0m
12:11:10.727 [0m [90m 54 |[39m     })[33m;[39m[0m
12:11:10.727 [0m [90m 55 |[39m   }[0m
12:11:10.727 [0m [90m 56 |[39m[0m
12:11:10.796 Error: Command "npm run build" exited with 1
