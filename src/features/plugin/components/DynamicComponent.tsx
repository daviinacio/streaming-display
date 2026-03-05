import * as React from "react";
import * as Babel from "@babel/standalone";

export interface DynamicComponentProps {
  code: string;
  props?: any;
  dependencies?: Array<{
    name: string;
    component: React.ReactNode;
  }>;
}

export const transformStringToJsxComponent = async (
  code: string,
  dependencies?: DynamicComponentProps["dependencies"],
) => {
  const transpiledCode = Babel.transform(code, {
    filename: "dynamic.tsx",
    presets: ["react", "typescript", "env"],
    plugins: ["transform-modules-commonjs"],
  }).code;

  const getComponent = new Function(
    "exports",
    "React",
    ...(dependencies?.map((it) => it.name) || []),
    `
      ${transpiledCode}
      return exports.default;
    `,
  );

  const component = getComponent(
    {},
    React,
    ...(dependencies?.map((it) => it.component) || []),
  );

  return component;
};

export function DynamicComponent({
  code,
  props,
  dependencies,
}: DynamicComponentProps) {
  const [Component, setComponent] = React.useState(null);
  const [errorMessage, setErrorMessage] = React.useState("");

  React.useEffect(() => {
    transformStringToJsxComponent(code, dependencies)
      .then((component) => setComponent(() => component))
      .catch((err) => {
        console.error("Error processing dynamic code:", err);
        setErrorMessage(err.message);
        setComponent(null);
      });
  }, [code]);

  if (errorMessage) {
    return <div style={{ color: "red" }}>Error: {errorMessage}</div>;
  }
  return Component ? (
    // @ts-ignore
    <Component {...props} />
  ) : (
    <div>Loading dynamic component...</div>
  );
}
