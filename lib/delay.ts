export function delay(
  waitSeconds: number,
  timeoutHandler: (timeout: number) => void = (): void => undefined
): Promise<void> {
  return new Promise((resolve) => {
    timeoutHandler(setTimeout(resolve, waitSeconds * 1000));
  });
}
