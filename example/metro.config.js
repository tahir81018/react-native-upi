const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// 1. Watch the library root
config.watchFolders = [workspaceRoot];

// 2. Only resolve packages from example/node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
];

// 3. Block Metro from indexing or resolving any parent node_modules
const parentNodeModules = path.resolve(workspaceRoot, 'node_modules');
config.resolver.blockList = [
  new RegExp(`^${parentNodeModules.replace(/[/\\]/g, '[/\\\\]')}.*`),
];

// 4. Force all dependencies (especially react & react-native) to use example/node_modules
config.resolver.extraNodeModules = {
  '@tahir810/react-native-upi': workspaceRoot,
  react: path.resolve(projectRoot, 'node_modules/react'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
};

module.exports = config;
