if (import.meta.env.PROD && typeof document === "undefined") {
  Object.assign(globalThis, {
    document: {
      currentScript: {
        src: self.location.href,
      },
    },
  });
}