import path from "path";

export default ({ mode }) => {
  if (mode === "netlify") {
    return {
      build: {
        rollupOptions: {
          input: {
            index: path.resolve(__dirname, "index.html"),
          },
        },
      },
    };
  }

  return {
    build: {
      lib: {
        entry: path.resolve(__dirname, "src/index.ts"),
        name: "stimulus-content-loader",
      },
      rollupOptions: {
        external: ["@hotwired/stimulus"],
        output: {
          globals: {
            "@hotwired/stimulus": "Stimulus",
          },
        },
      },
    },
  };
};
