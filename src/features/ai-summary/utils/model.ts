export function parseModelName(modelName: string): string {
  const model = modelName.split("/")[1];
  return model;
}
