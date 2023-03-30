const fetch = require("node-fetch");
const { format, utcToZonedTime } = require("date-fns-tz");
const timeZone = "America/Los_Angeles";

(async () => {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK;
  const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY;
  const GITHUB_SHA = process.env.GITHUB_SHA;
  const GITHUB_HEAD_REF = process.env.GITHUB_HEAD_REF;
  const GITHUB_SERVER_URL = process.env.GITHUB_SERVER_URL || "https://github.com";

  const commitResponse = await fetch(
    `https://api.github.com/repos/${GITHUB_REPOSITORY}/commits/${GITHUB_SHA}`,
    {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
      },
    },
  );
  const commitData = await commitResponse.json();
  const commitDate = commitData.commit.committer.date;
  const humanReadableDate = format(
    utcToZonedTime(commitDate, timeZone),
    "MMMM dd, yyyy hh:mm a z",
  );

  const linesAdded = commitData.files
    .filter((file) => file.filename.endsWith(".cs"))
    .reduce((sum, file) => sum + file.additions, 0);

  const linesDeleted = commitData.files
    .filter((file) => file.filename.endsWith(".cs"))
    .reduce((sum, file) => sum + file.deletions, 0);

  const commitMessage = commitData.commit.message.split("\n");
  const commitTitle = commitMessage[0];
  const commitDescription = commitMessage.slice(1).join("\n").trim();
  const repoName = GITHUB_REPOSITORY.split("/")[1];

  const forumTag = {
    id: "123456789012345678",
    name: "example-tag",
    moderated: false,
    emoji_id: null,
    emoji_name: null,
  };

  await fetch(DISCORD_WEBHOOK, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: `${commitDescription}\n${humanReadableDate}\n\n[View Commit](${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/commit/${GITHUB_SHA})`,
      thread_name: `${repoName}【+${linesAdded}, -${linesDeleted}】${commitTitle}`,
      components: [
        {
          type: 1, // Action row
          components: [
            {
              type: 2, // Button
              label: forumTag.name,
              custom_id: forumTag.id,
              emoji: {
                id: forumTag.emoji_id,
                name: forumTag.emoji_name,
              },
            },
          ],
        },
      ],
    }),
  });
})();
