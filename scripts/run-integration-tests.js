process.env.RUN_INTEGRATION_TESTS = 'true';

require('jest').run(['--config', 'jest.integration.config.js', '--runInBand'])
  .catch(() => process.exit(1));
