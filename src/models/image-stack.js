const mongoose = require("mongoose");

const ImageStack = mongoose.model("ImageStack", {
  unprocessed: Array,
  token: String,
  processed: [
    {
      path: String,
      lines: [
        {
          x1: Number,
          y1: Number,
          x2: Number,
          y2: Number
        }
      ],
      blocks: [
        {
          x1: Number,
          y1: Number,
          x2: Number,
          y2: Number
        }
      ],
      footnote: {
        x1: Number,
        y1: Number,
        x2: Number,
        y2: Number
      },
      paragraphs: [
        {
          x1: Number,
          y1: Number,
          x2: Number,
          y2: Number
        }
      ]
    }
  ],
  total: Number,
  finished: Number
});

module.exports = ImageStack