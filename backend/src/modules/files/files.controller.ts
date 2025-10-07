import { Controller, Post, UploadedFile, UseInterceptors, Get, Param, Res, UseGuards, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { FilesService } from './files.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { existsSync, createReadStream } from 'fs';
import { join } from 'path';

@ApiTags('files')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload a file' })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const savedFile = await this.filesService.saveFile(file);
    return {
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: savedFile.filename,
        originalname: savedFile.originalname,
        mimetype: savedFile.mimetype,
        size: savedFile.size,
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a file by ID' })
  @ApiResponse({ status: 200, description: 'File retrieved successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async getFile(@Param('id') id: string, @Res() res: Response) {
    const file = await this.filesService.getFileById(id);
    
    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }

    const filePath = this.filesService.getFilePath(file.filename);
    
    if (!existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server',
      });
    }

    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${file.originalName}"`,
    });

    const fileStream = createReadStream(filePath);
    fileStream.pipe(res);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a file' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async deleteFile(@Param('id') id: string) {
    const file = await this.filesService.getFileById(id);
    
    if (!file) {
      return {
        success: false,
        message: 'File not found',
      };
    }

    const deleted = await this.filesService.deleteFile(file.filename);
    
    if (deleted) {
      // Optionally delete the database record
      // await this.filesService.prisma.document.delete({ where: { id } });
    }

    return {
      success: deleted,
      message: deleted ? 'File deleted successfully' : 'Failed to delete file',
    };
  }
}
