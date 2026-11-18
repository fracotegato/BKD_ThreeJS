// Relative base so the same build works on a dev server and under a GitHub Pages sub-path
// (https://<user>.github.io/<repository>/).
export default {
  base: './',
  build: { chunkSizeWarningLimit: 1500 },
};
