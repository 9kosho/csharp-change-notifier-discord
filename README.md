## Usage for `discord-notification-action`

```yml
name: Discord Notification

on:
  push:
    paths:
      - "**.cs"

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v2
      - name: Send Discord notification
        uses: 9kosho/github-actions-templates/discord-notification-action@main
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          DISCORD_WEBHOOK: ${{ secrets.DISCORD_WEBHOOK }}
```
