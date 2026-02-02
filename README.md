# Download Organizer

A Firefox browser extension that automatically organizes downloads into folders based on simple, user-defined rules.

## Features

- Route downloads by website (domain) and file extension
- Fully customizable rules via a popup UI
- Rules stored locally using `browser.storage.local`
- Default rules initialized on first run
- No external network requests or data collection
- Works automatically in the background

## How It Works

1. When a download starts, the extension intercepts it.
2. The download is re-initiated into a folder determined by matching rules.
3. Rules are matched using domain and/or file extension.
4. User changes take effect immediately without restarting the browser.

## Rules

Rules consist of:
- A name
- Optional domain match (substring match)
- Optional file extension match
- Target folder path

If no rule matches, a default folder is used.

## Note
- use / as base and theen set the path for easy access

## Customization

- Click the extension icon to open the popup.
- Search, add, edit, or delete rules.
- Changes are saved automatically and applied instantly.

## Keyboard Shortcut

- A keyboard shortcut can be configured to open the popup.
- Shortcut settings can be changed in Firefox’s extension shortcuts settings.

## Privacy

- No user data is collected.
- No data is sent to external servers.
- All data remains local to the browser.

## Permissions

- `downloads`: Required to manage and re-route downloads.
- `storage`: Required to store user-defined rules.

## Development

### Run locally

```sh
web-ext run
