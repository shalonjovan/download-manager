console.log("Smart Download Manager loaded");

function getTargetPath(originalFilename) {
  const lower = originalFilename.toLowerCase();

  if (lower.endsWith(".pdf"))
    return "Documents/PDFs/" + originalFilename;

  if (lower.endsWith(".zip") || lower.endsWith(".tar.gz"))
    return "Archives/" + originalFilename;

  if (lower.endsWith(".mp4") || lower.endsWith(".mkv"))
    return "Videos/" + originalFilename;

  return "Others/" + originalFilename;
}

browser.downloads.onCreated.addListener(async (download) => {
  // Ignore downloads we re-trigger ourselves
  if (download.byExtensionId) return;

  const filename = download.filename.split("/").pop();
  const newPath = getTargetPath(filename);

  console.log("Redirecting:", download.url, "→", newPath);

  try {
    // Cancel original
    await browser.downloads.cancel(download.id);
    await browser.downloads.erase({ id: download.id });

    // Start new download with custom path
    await browser.downloads.download({
      url: download.url,
      filename: newPath,
      conflictAction: "uniquify"
    });

  } catch (err) {
    console.error("Redirect failed:", err);
  }
});
