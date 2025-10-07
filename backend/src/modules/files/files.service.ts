import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, mkdirSync, unlink } from 'fs';
import { join } from 'path';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private readonly uploadDir: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.uploadDir = this.configService.get('UPLOAD_DIR', './uploads');
    this.ensureUploadDirExists();
  }

  private ensureUploadDirExists() {
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  getFilePath(filename: string): string {
    return join(process.cwd(), this.uploadDir, filename);
  }

  async saveFile(file: Express.Multer.File): Promise<{ filename: string; originalname: string; mimetype: string; size: number }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return {
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    };
  }

  async deleteFile(filename: string): Promise<boolean> {
    return new Promise((resolve) => {
      const filePath = this.getFilePath(filename);
      
      if (!existsSync(filePath)) {
        return resolve(true);
      }

      unlink(filePath, (err) => {
        if (err) {
          this.logger.error(`Failed to delete file ${filename}:`, err);
          return resolve(false);
        }
        resolve(true);
      });
    });
  }

  async createFileRecord(data: {
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    userId: string;
    type: string;
    metadata?: Record<string, any>;
  }) {
    return this.prisma.document.create({
      data: {
        filename: data.filename,
        originalName: data.originalName,
        mimeType: data.mimeType,
        size: data.size,
        type: data.type,
        path: this.getFilePath(data.filename),
        metadata: data.metadata || {},
        user: { connect: { id: data.userId } },
      },
    });
  }

  async linkFileToPayment(fileId: string, paymentId: string) {
    return this.prisma.document.update({
      where: { id: fileId },
      data: {
        payment: { connect: { id: paymentId } },
      },
    });
  }

  async getFileById(id: string) {
    return this.prisma.document.findUnique({
      where: { id },
    });
  }
}
