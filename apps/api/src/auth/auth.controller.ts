import { Controller, Post, Get, Body, HttpCode, HttpStatus, UseGuards, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { GoogleOAuthGuard } from './google.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: any) {
    return this.authService.register(body);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() body: any) {
    return this.authService.login(body);
  }

  // Mobile Google OAuth — client sends access_token, backend validates with Google API
  // No redirect URI configuration needed — works for all users on all devices
  @HttpCode(HttpStatus.OK)
  @Post('google/mobile')
  async googleMobile(@Body() body: { accessToken: string }) {
    return this.authService.validateGoogleToken(body.accessToken);
  }

  @Post('complete-profile')
  async completeProfile(@Body() body: any) {
    const { userId, ...data } = body;
    return this.authService.completeProfile(userId, data);
  }

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  async googleAuth(@Req() req: any) {
    // Initiates the Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: any, @Res() res: any) {
    const data = req.user;
    const state = req.query.state as string;

    if (!data || !data.access_token) {
      if (state && state !== 'web') {
        return res.redirect(`${state}?error=GoogleAuthFailed`);
      }
      return res.redirect('http://localhost:3000/login?error=GoogleAuthFailed');
    }

    const { access_token, user } = data;
    const params = `token=${access_token}&userId=${user.id}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}&isProfileComplete=${user.isProfileComplete}`;

    if (state && state !== 'web') {
      // state contains the mobile app's deep link scheme
      return res.redirect(`${state}?${params}`);
    }

    return res.redirect(`http://localhost:3000/login?${params}`);
  }
}
