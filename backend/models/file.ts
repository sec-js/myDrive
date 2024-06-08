import mongoose, { Document } from "mongoose";
import { Binary, ObjectId } from "mongodb";

const fileSchema = new mongoose.Schema({
  length: {
    type: Number,
    required: true,
  },
  chunkSize: {
    type: Number,
  },
  uploadDate: {
    type: Date,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  metadata: {
    type: {
      owner: {
        type: String,
        required: true,
      },
      parent: {
        type: String,
        required: true,
      },
      parentList: {
        type: String,
        required: true,
      },
      hasThumbnail: {
        type: Boolean,
        required: true,
      },
      isVideo: {
        type: Boolean,
        required: true,
      },
      thumbnailID: String,
      size: {
        type: Number,
        required: true,
      },
      IV: {
        type: Buffer,
        required: true,
      },
      linkType: String,
      link: String,
      filePath: String,
      s3ID: String,
      personalFile: Boolean,
    },
    required: true,
  },
});

export interface FileInterface
  extends mongoose.Document<string | mongoose.Types.ObjectId> {
  length: number;
  chunkSize: number;
  uploadDate: string;
  filename: string;
  lastErrorObject: { updatedExisting: any };
  metadata: {
    owner: string | ObjectId;
    parent: string;
    parentList: string;
    hasThumbnail: boolean;
    isVideo: boolean;
    thumbnailID?: string;
    size: number;
    IV: Buffer;
    linkType?: "one" | "public";
    link?: string;
    filePath?: string;
    s3ID?: string;
    personalFile?: boolean;
  };
}

const File = mongoose.model<FileInterface>("fs.files", fileSchema);

export default File;
module.exports = File;
