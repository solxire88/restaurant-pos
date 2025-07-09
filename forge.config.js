// forge.config.js
const path = require('path');
const { copy, mkdirs } = require('fs-extra');
const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

const iconPath = path.resolve(__dirname, 'assets', 'icons', 'icon.ico');
console.log('➔ Installer icon path:', iconPath, '→ exists?', require('fs').existsSync(iconPath));

module.exports = {
  packagerConfig: {
    name: 'Point Of Sale',
    executableName: 'PointOfSale',
    asar: { unpack: ['**/*.node'] },
    // icon: iconPath,
    extraResource: [
      'node_modules/escpos-usb',
      'node_modules/usb'
    ],
    // ← Build both ia32 and x64 bundles
    arch: ['ia32', 'x64'],
  },


  rebuildConfig: { force: true },

  hooks: {
    async packageAfterCopy(_, buildPath) {
      const nativePkgs = ['escpos-usb', 'usb', 'node-gyp-build'];
      const srcRoot = path.resolve(__dirname, 'node_modules');
      const destRoot = path.join(buildPath, 'node_modules');

      for (const pkg of nativePkgs) {
        const src = path.join(srcRoot, pkg);
        const dest = path.join(destRoot, pkg);
        await mkdirs(path.dirname(dest));
        await copy(src, dest, { recursive: true });
      }
    }
  },

  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'PointOfSale',
        authors: 'Your Company',
        exe: 'PointOfSale.exe',
        setupExe: 'PointOfSale.Setup.exe',
        noMsi: true,
      }
    },
    
    { name: '@electron-forge/maker-zip', platforms: ['darwin'] },
    { name: '@electron-forge/maker-deb', config: {} },
    { name: '@electron-forge/maker-rpm', config: {} },
  ],

  plugins: [
    { name: '@electron-forge/plugin-auto-unpack-natives', config: {} },
    {
      name: '@electron-forge/plugin-vite',
      config: {
        build: [
          { target: 'main', entry: 'src/electron/main.js', config: 'vite.main.config.mjs' },
          { target: 'preload', entry: 'src/electron/preload.js', config: 'vite.preload.config.mjs' },
        ],
        renderer: [
          {
            name: 'main_window',
            entry: 'src/renderer/index.html',
            config: 'vite.renderer.config.mjs',
            preload: 'src/electron/preload.js',
          }
        ]
      }
    },
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ]
};
