await $`pnpm install`;

cd("apps");

within(async () => {
  cd("server");
  await $`pnpm migrate:dev`;
  await $`pnpm dev`;
});

within(() => {
  cd("../client");
  $`pnpm dev`;
});
