/**
 * Resorted to using this post-build script because vite doesn't have
 * an elegant way (not to my knowledge) to move css files from public
 * to a separate directory in dist for library mode.
 *
 * I've tried different solutions mentioned in internet... nothing seems
 * to work. A person with similar problem:
 * https://github.com/vitejs/vite/issues/4863#issuecomment-1297615378
 *
 * The comment doesn't have an answer yet though.
 */

const fs = require("fs");
const path = require("path");

const cssPath = path.join(__dirname, "..", "dist", "whatsapp-editor.css");
const cssDestinationPath = path.join(
  __dirname,
  "..",
  "dist",
  "styles",
  "whatsapp-editor.css"
);

const imgPath = path.join(__dirname, "..", "dist", "editor.png");

fs.rename(cssPath, cssDestinationPath, function (err) {
  if (err) {
    throw err;
  } else {
    console.log("Successfully moved whatsapp-editor.css file!");
  }
});

fs.unlink(imgPath, function (err) {
  if (err) {
    throw err;
  } else {
    console.log("Successfully deleted the image file!");
  }
});
