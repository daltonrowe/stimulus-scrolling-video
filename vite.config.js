import path from "path";

export default ({ mode }) => {
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
