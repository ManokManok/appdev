const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { getDefaultConfig: getExpoDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const oninsRoot = path.resolve(projectRoot, '..', 'ONINS');

/**
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = mergeConfig(getDefaultConfig(__dirname), getExpoDefaultConfig(__dirname), {
  watchFolders: [projectRoot],
  resolver: {
    blockList: [
      // Symfony web login writes cache/logs; never watch the sibling API project.
      new RegExp(
        `${oninsRoot.replace(/\\/g, '/').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/.*`
      ),
      /.*[\\/]android[\\/]app[\\/]build[\\/].*/,
      /.*[\\/]android[\\/]\.gradle[\\/].*/,
      /.*[\\/]\.bundle[\\/].*/,
    ],
  },
});

module.exports = config;
