import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  /**
   * Override the getTracker method to extract the IP from the x-forwarded-for header
   * when behind a proxy like nginx
   */
  protected getTracker(req: Record<string, any>): string {
    // If behind a proxy, use the x-forwarded-for header
    if (req.headers['x-forwarded-for']) {
      return req.headers['x-forwarded-for'].split(',')[0].trim();
    }
    // Fall back to the default behavior (remoteAddress)
    return req.ips.length ? req.ips[0] : req.ip;
  }

  /**
   * Override the getRequestResponse method to handle both HTTP and GraphQL contexts
   */
  protected async getRequestResponse(context: ExecutionContext) {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest();
    const response = httpContext.getResponse();

    // Handle GraphQL context if needed
    if (!request) {
      const gqlCtx = context.getArgByIndex(2);
      if (gqlCtx && gqlCtx.req) {
        return { req: gqlCtx.req, res: gqlCtx.res };
      }
    }

    return { req: request, res: response };
  }
}
