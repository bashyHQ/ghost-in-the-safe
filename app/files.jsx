let BrowserFS = require('browserfs/dist/browserfs.min.js');
console.log(BrowserFS)

BrowserFS.install(window);
// Constructs an instance of the LocalStorage-backed file system.

var fsroot = new BrowserFS.FileSystem.MountableFileSystem();

fsroot.mount('/sources', new BrowserFS.FileSystem.LocalStorage());
fsroot.mount('/theme', new BrowserFS.FileSystem.ZipFS(require('buffer!../lib/Frostmango-master.zip')));

BrowserFS.initialize(fsroot);

export default { BrowserFS: BrowserFS, fs: window.require('fs')}
