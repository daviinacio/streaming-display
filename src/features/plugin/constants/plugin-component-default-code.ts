import { PLUGIN_TYPE_OPTIONS } from "./plugin-type.options";

export const PLUGIN_COMPONENT_DEFAULT_CODE: {
  [key in PLUGIN_TYPE_OPTIONS]: string;
} = {
  player:
    "export default function ({ src, handler, ...props }) {\n  return (\n    <ReactPlayer src={src} controls={false} {...props} />\n  )\n}",
  source_handler:
    "export default function ({ src }) {\n  return {\n    sourceUrl: src\n  }\n}",
  header_left:
    'const { CircleQuestionMark } = Lucide;\nexport default function ({ src, ...props }) {\n  \n  function handleClick() {\n    console.log("click");\n  }\n  return (\n    <PlayerHudAction\n      onClick={handleClick}\n      {...props}\n    >\n      <CircleQuestionMark />\n    </PlayerHudAction>\n  )\n}',
  header_right:
    'const { CircleQuestionMark } = Lucide;\nexport default function ({ src, ...props }) {\n  \n  function handleClick() {\n    console.log("click");\n  }\n  return (\n    <PlayerHudAction\n      onClick={handleClick}\n      {...props}\n    >\n      <CircleQuestionMark />\n    </PlayerHudAction>\n  )\n}',
  controls_left:
    'const { CircleQuestionMark } = Lucide;\nexport default function ({ src, ...props }) {\n  \n  function handleClick() {\n    console.log("click");\n  }\n  return (\n    <PlayerHudAction\n      onClick={handleClick}\n      {...props}\n    >\n      <CircleQuestionMark />\n    </PlayerHudAction>\n  )\n}',
  controls_right:
    'const { CircleQuestionMark } = Lucide;\nexport default function ({ src, ...props }) {\n  \n  function handleClick() {\n    console.log("click");\n  }\n  return (\n    <PlayerHudAction\n      onClick={handleClick}\n      {...props}\n    >\n      <CircleQuestionMark />\n    </PlayerHudAction>\n  )\n}',
  menu_item:
    'const { CircleQuestionMark } = Lucide;\n\nexport default function () {\n  return (\n    <HeaderButton onClick={() => console.log("click")}>\n      <CircleQuestionMark />\n    </HeaderButton>\n  )\n}',
} as const;
