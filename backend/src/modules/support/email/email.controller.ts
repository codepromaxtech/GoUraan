import {
  Controller,
  Post,
  Body,
  Headers,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { SupportService } from '../support.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('support')
@Controller('support/email')
export class EmailController {
  private readonly logger = new Logger(EmailController.name);

  constructor(private readonly supportService: SupportService) {}

  @Post('incoming')
  @ApiOperation({ summary: 'Handle incoming support emails' })
  @ApiResponse({ status: 201, description: 'Email processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid email data' })
  async handleIncomingEmail(
    @Body() emailData: {
      from: string;
      to: string;
      subject: string;
      text: string;
      html?: string;
      headers?: Record<string, string>;
      attachments?: Array<{
        filename: string;
        content: string;
        contentType: string;
      }>;
    },
    @Headers('x-api-key') apiKey: string,
  ) {
    // In a production environment, validate the API key here
    // if (apiKey !== process.env.SUPPORT_EMAIL_API_KEY) {
    //   throw new BadRequestException('Invalid API key');
    // }

    if (!emailData.from || !emailData.subject) {
      throw new BadRequestException('From and subject are required');
    }

    try {
      // Extract the email address from the "From" field (it might be in format "Name <email@example.com>")
      const fromEmail = emailData.from.match(/<([^>]+)>/) ? 
        emailData.from.match(/<([^>]+)>/)[1] : 
        emailData.from;

      // Process attachments if any
      const attachments: string[] = [];
      if (emailData.attachments && emailData.attachments.length > 0) {
        // In a real implementation, you would save the attachments to storage
        // and store the URLs in the attachments array
        this.logger.log(`Received ${emailData.attachments.length} attachments`);
        emailData.attachments.forEach(attachment => {
          attachments.push(attachment.filename);
        });
      }

      // Check if this is a reply to an existing ticket (look for ticket ID in subject or headers)
      const ticketIdMatch = emailData.subject.match(/\[Ticket #(\w+)\]/);
      if (ticketIdMatch && ticketIdMatch[1]) {
        const ticketId = ticketIdMatch[1];
        
        // Add the email as a response to the existing ticket
        await this.supportService.sendEmailResponse(
          ticketId,
          {
            subject: emailData.subject,
            message: emailData.text || emailData.html || 'No message content',
            isInternalNote: false,
            attachments: emailData.attachments?.map(a => ({
              filename: a.filename,
              path: `uploads/attachments/${a.filename}`, // This would be the path where you save the file
            })),
          },
          undefined, // No user ID for email responses
        );

        return { success: true, action: 'replied_to_ticket', ticketId };
      } else {
        // This is a new support ticket
        const ticket = await this.supportService.createTicketFromEmail(
          fromEmail,
          emailData.subject,
          emailData.text || emailData.html || 'No message content',
          attachments,
          {
            originalEmail: {
              to: emailData.to,
              headers: emailData.headers,
            },
          },
        );

        return { success: true, action: 'created_ticket', ticketId: ticket.id };
      }
    } catch (error) {
      this.logger.error('Error processing incoming email:', error);
      throw new BadRequestException(`Failed to process email: ${error.message}`);
    }
  }
}
