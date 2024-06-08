import { Request, Response } from "express";
import FileService from "../services/FileService";
import FileSystemService from "../services/ChunkService/FileSystemService";
import S3Service from "../services/ChunkService/S3Service";
import User, { UserInterface } from "../models/user";
import sendShareEmail from "../utils/sendShareEmail";
import {
  createStreamVideoCookie,
  removeStreamVideoCookie,
} from "../cookies/createCookies";

const fileService = new FileService();

type userAccessType = {
  _id: string;
  emailVerified: boolean;
  email: string;
  s3Enabled: boolean;
};

interface RequestTypeFullUser extends Request {
  user?: UserInterface;
  encryptedToken?: string;
  accessTokenStreamVideo?: string;
}

interface RequestType extends Request {
  user?: userAccessType;
  encryptedToken?: string;
}

type ChunkServiceType = FileSystemService | S3Service;

class FileController {
  chunkService: ChunkServiceType;

  constructor(chunkService: ChunkServiceType) {
    this.chunkService = chunkService;
  }

  getThumbnail = async (req: RequestTypeFullUser, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const user = req.user;
      const id = req.params.id;

      const decryptedThumbnail = await this.chunkService.getThumbnail(user, id);

      res.send(decryptedThumbnail);
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nGet Thumbnail Error File Route:", e.message);
      }
      res.status(500).send("Server error getting thumbnail");
    }
  };

  getFullThumbnail = async (req: RequestTypeFullUser, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const user = req.user;
      const fileID = req.params.id;

      await this.chunkService.getFullThumbnail(user, fileID, res);
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nGet Thumbnail Full Error File Route:", e.message);
      }
      res.status(500).send("Server error getting image");
    }
  };

  uploadFile = async (req: RequestTypeFullUser, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const user = req.user;
      const busboy = req.busboy;

      req.pipe(busboy);

      const file = await this.chunkService.uploadFile(user, busboy, req);

      res.send(file);
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nUploading File Error File Route:", e.message);
      }

      res.writeHead(500, { Connection: "close" });
      res.end();
    }
  };

  getPublicDownload = async (req: RequestType, res: Response) => {
    try {
      const ID = req.params.id;
      const tempToken = req.params.tempToken;

      await this.chunkService.getPublicDownload(ID, tempToken, res);
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nGet Public Download Error File Route:", e.message);
      }
      res.status(500).send("Server error downloading");
    }
  };

  removeLink = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const id = req.params.id;
      const userID = req.user._id;

      await fileService.removeLink(userID, id);

      res.send();
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nRemove Public Link Error File Route:", e.message);
      }
      res.status(500).send("Server error removing link");
    }
  };

  makePublic = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const fileID = req.params.id;
      const userID = req.user._id;

      const token = await fileService.makePublic(userID, fileID);

      res.send(token);
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nMake Public Error File Route:", e.message);
      }
      res.status(500).send("Server error making public");
    }
  };

  getPublicInfo = async (req: RequestType, res: Response) => {
    try {
      const id = req.params.id;
      const tempToken = req.params.tempToken;

      const file = await fileService.getPublicInfo(id, tempToken);

      res.send(file);
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nGet Public Info Error File Route:", e.message);
      }
      res.status(500).send("Server error getting public info");
    }
  };

  makeOneTimePublic = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const id = req.params.id;
      const userID = req.user._id;

      const token = await fileService.makeOneTimePublic(userID, id);

      res.send(token);
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nMake One Time Public Link Error File Route:", e.message);
      }

      res.status(500).send("Server error making public");
    }
  };

  getFileInfo = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const fileID = req.params.id;
      const userID = req.user._id;

      const file = await fileService.getFileInfo(userID, fileID);

      res.send(file);
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nGet File Info Error File Route:", e.message);
      }

      res.status(500).send("Server error getting file info");
    }
  };

  getQuickList = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const user = req.user;

      const quickList = await fileService.getQuickList(user);

      res.send(quickList);
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nGet Quick List Error File Route:", e.message);
      }

      res.status(500).send("Server error getting quick list");
    }
  };

  getList = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const user = req.user;
      const query = req.query;

      const fileList = await fileService.getList(user, query);

      res.send(fileList);
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nGet File List Error File Route:", e.message);
      }

      res.status(500).send("Server error getting file list");
    }
  };

  getDownloadToken = async (req: RequestTypeFullUser, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const user = req.user;

      const tempToken = await fileService.getDownloadToken(user);

      res.send({ tempToken });
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nGet Download Token Error File Route:", e.message);
      }

      res.status(500).send("Server error getting download token");
    }
  };

  getAccessTokenStreamVideo = async (
    req: RequestTypeFullUser,
    res: Response
  ) => {
    if (!req.user) return;

    try {
      const user = req.user;

      const currentUUID = req.headers.uuid as string;

      const streamVideoAccessToken = await user.generateAuthTokenStreamVideo(
        currentUUID
      );

      createStreamVideoCookie(res, streamVideoAccessToken);

      res.send();
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log(
          "\nGet Access Token Stream Video Fle Route Error:",
          e.message
        );
      }

      res.status(500).send("Server error getting video stream token");
    }
  };

  removeStreamVideoAccessToken = async (
    req: RequestTypeFullUser,
    res: Response
  ) => {
    if (!req.user) return;

    try {
      const userID = req.user._id;

      const accessTokenStreamVideo = req.accessTokenStreamVideo!;

      await User.updateOne(
        { _id: userID },
        { $pull: { tempTokens: { token: accessTokenStreamVideo } } }
      );

      removeStreamVideoCookie(res);

      res.send();
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nRemove Video Token File Router Error:", e.message);
      }

      res.status(500).send("Server error removing video stream token");
    }
  };

  removeTempToken = async (req: RequestTypeFullUser, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const user = req.user;
      const tempToken = req.params.tempToken;
      const currentUUID = req.params.uuid;

      await fileService.removeTempToken(user, tempToken, currentUUID);

      res.send();
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nRemove Temp Token Error File Route:", e.message);
      }

      res.status(500).send("Server error removing temp token");
    }
  };

  streamVideo = async (req: RequestTypeFullUser, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const user = req.user;
      const fileID = req.params.id;
      const headers = req.headers;

      await this.chunkService.streamVideo(user, fileID, headers, res, req);
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nStream Video Error File Route:", e.message);
      }

      res.status(500).send("Server error streaming video");
    }
  };

  downloadFile = async (req: RequestTypeFullUser, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const user = req.user;
      const fileID = req.params.id;

      await this.chunkService.downloadFile(user, fileID, res);
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nDownload File Error File Route:", e.message);
      }

      res.status(500).send("Server error downloading file");
    }
  };

  getSuggestedList = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;
      let searchQuery = req.query.search || "";

      const { fileList, folderList } = await fileService.getSuggestedList(
        userID,
        searchQuery
      );

      return res.send({ folderList, fileList });
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nGet Suggested List Error File Route:", e.message);
      }

      res.status(500).send("Server error getting suggested list");
    }
  };

  renameFile = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const fileID = req.body.id;
      const title = req.body.title;
      const userID = req.user._id;

      await fileService.renameFile(userID, fileID, title);

      res.send();
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nRename File Error File Route:", e.message);
      }

      res.status(500).send("Server error renaming file");
    }
  };

  sendEmailShare = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const user = req.user!;

      const fileID = req.body.file._id;
      const respient = req.body.file.resp;

      const file = await fileService.getFileInfo(user._id, fileID);

      await sendShareEmail(file, respient);

      res.send();
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nSend Share Email Error File Route:", e.message);
      }

      res.status(500).send("Server error sending email link");
    }
  };

  moveFile = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const fileID = req.body.id;
      const userID = req.user._id;
      const parentID = req.body.parent;

      await fileService.moveFile(userID, fileID, parentID);

      res.send();
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nMove File Error File Route:", e.message);
      }

      res.status(500).send("Server error moving file");
    }
  };

  deleteFile = async (req: RequestType, res: Response) => {
    if (!req.user) {
      return;
    }

    try {
      const userID = req.user._id;
      const fileID = req.body.id;

      await this.chunkService.deleteFile(userID, fileID);

      res.send();
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log("\nDelete File Error File Route:", e.message);
      }

      res.status(500).send("Server error deleting file");
    }
  };
}

export default FileController;
