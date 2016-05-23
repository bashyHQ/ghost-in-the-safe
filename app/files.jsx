let BrowserFS = require('browserfs/dist/browserfs.min.js')
console.log(BrowserFS)

BrowserFS.install(window)
// Constructs an instance of the LocalStorage-backed file system.

var fsroot = new BrowserFS.FileSystem.MountableFileSystem()

fsroot.mount('/', new BrowserFS.FileSystem.LocalStorage())
fsroot.mount('/types', new BrowserFS.FileSystem.InMemory())
fsroot.mount('/public', new BrowserFS.FileSystem.InMemory())
fsroot.mount('/themes', new BrowserFS.FileSystem.InMemory())
fsroot.mount('/themes/frostmango', new BrowserFS.FileSystem.ZipFS(require('../lib/Frostmango-master.zip')))

fsroot.mount('/themes/decent', new BrowserFS.FileSystem.ZipFS(require('../lib/decent-v1.1.1.zip')))

BrowserFS.initialize(fsroot)

let fs = window.fs = window.require('fs')


try {
  fs.mkdirSync('/files')
} catch(EEXIST){}

fs.writeFileSync('/config.yaml', require("./raw/default_config.yaml"))
fs.writeFileSync('/types/mime.types', require("./raw/mime.types"))
fs.writeFileSync('/types/node.types', "")

try {
  fs.mkdirSync('/posts')
} catch(EEXIST){}
fs.writeFileSync('/posts/example.md', require("./raw/example.md"))


export default { BrowserFS: BrowserFS, fs: window.fs}
