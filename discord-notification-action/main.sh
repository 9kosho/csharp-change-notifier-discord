#!/bin/bash

# Fetch commit information using GitHub API
commit_date=$(curl --silent --location --header "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/${GITHUB_REPOSITORY}/commits/${GITHUB_SHA}" |
  jq -r '.commit.committer.date')
human_readable_date=$(TZ="America/Los_Angeles" date -d"$commit_date" +"%B %d, %Y %I:%M %p %Z")
lines_added=$(curl --silent --location --header "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/${GITHUB_REPOSITORY}/commits/${GITHUB_SHA}" |
  jq -r '.files | map(select(.filename | test(".cs$"))) | map(.additions) | add')
lines_deleted=$(curl --silent --location --header "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/${GITHUB_REPOSITORY}/commits/${GITHUB_SHA}" |
  jq -r '.files | map(select(.filename | test(".cs$"))) | map(.deletions) | add')

# Send Discord notification
curl --silent --location --request POST "$DISCORD_WEBHOOK" \
  --header 'Content-Type: application/json' \
  --data-raw "{
    \"content\": \"\",
    \"embeds\": [
      {
        \"title\": \"New Commit!\",
        \"description\": \"${GITHUB_HEAD_REF}\",
        \"fields\": [
          {
            \"name\": \"Lines added\",
            \"value\": \"+${lines_added}\",
            \"inline\": true
          },
          {
            \"name\": \"Lines deleted\",
            \"value\": \"-${lines_deleted}\",
            \"inline\": true
          },
          {
            \"name\": \"Date\",
            \"value\": \"${human_readable_date}\",
            \"inline\": false
          }
        ],
        \"url\": \"${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/commit/${GITHUB_SHA}\"
      }
    ]
  }"
