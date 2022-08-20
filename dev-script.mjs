await $`pnpm install`;

cd("apps");

within(async () => {
  cd("server");
  await $`pnpm migrate:dev`;
  await Promise.all([
    $`pnpm bundle:watch`,
    $`pnpm run:watch`,
  ]);
});

within(() => {
  cd("../client");
  $`pnpm dev`;
});
