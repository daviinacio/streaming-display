export default {
  id: "youtube",
  components: [
    {
      enabled: false,
      name: "Player",
      type: "player",
      code: "export default function ({ src, handler, player, ...props }) {\n  return (\n    <ReactPlayer src={handler?.sourceUrl} controls={false} {...props} {...player} />\n  )\n}",
      isEdit: false,
      isDirty: true,
    },
    {
      enabled: true,
      name: "Source Handler",
      type: "source_handler",
      code: "export default async function ({ src }) {\n  const url = new URL(src);\n\n  if (url.pathname.split('/')[1] === 'live') {\n    src = `${url.origin}/watch?v=${url.pathname.split('/')[2]}`;\n  }\n\n  const metadata = await fetch(\n    `https://noembed.com/embed?url=${src}`\n  ).then((response) => response.json())\n\n  if (!metadata) return;\n\n  return {\n    title: metadata.title,\n    sourceUrl: src\n  }\n}",
      isEdit: false,
      isDirty: true,
    },
  ],
  enabled: true,
  match: [
    "https://www.youtube.com/watch?v=*",
    "https://www.youtube.com/live/*",
    "https://youtube.com/live/*",
  ],
  name: "Youtube",
  isBuiltin: false,
};
