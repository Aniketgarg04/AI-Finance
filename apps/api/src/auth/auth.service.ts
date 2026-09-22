import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(data: any) {
    const { email, password, name, phone, address, dob, pan, employmentType, annualIncome } = data;
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new UnauthorizedException('Email already in use');
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        address,
        dob: dob ? new Date(dob) : null,
        pan,
        employmentType: employmentType || 'SALARIED',
        annualIncome: annualIncome ? parseFloat(annualIncome.toString()) : 0,
      },
    });
    
    const isProfileComplete = !!(user.phone && user.pan && user.dob && user.address);
    const payload = { email: user.email, sub: user.id, isProfileComplete };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, name: user.name, employmentType: user.employmentType, isProfileComplete },
    };
  }

  async login(data: any) {
    const { email, password } = data;
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    if (!user.password) {
      throw new UnauthorizedException('Please login with Google.');
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    const isProfileComplete = !!(user.phone && user.pan && user.dob && user.address);
    const payload = { email: user.email, sub: user.id, isProfileComplete };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, name: user.name, employmentType: user.employmentType, isProfileComplete },
    };
  }

  async validateOAuthUser(details: { googleId: string; email: string; name: string }) {
    let user = await this.prisma.user.findUnique({ where: { email: details.email } });

    if (user) {
      if (!user.googleId) {
        user = await this.prisma.user.update({
          where: { email: details.email },
          data: { googleId: details.googleId },
        });
      }
    } else {
      user = await this.prisma.user.create({
        data: {
          email: details.email,
          name: details.name,
          googleId: details.googleId,
        },
      });
    }

    const isProfileComplete = !!(user.phone && user.pan && user.dob && user.address);
    const payload = { email: user.email, sub: user.id, isProfileComplete };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, name: user.name, employmentType: user.employmentType, isProfileComplete },
    };
  }
  async validateGoogleToken(accessToken: string) {
    // Verify the access_token with Google's tokeninfo endpoint
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!response.ok) {
      throw new UnauthorizedException('Invalid Google access token');
    }

    const profile = await response.json();

    if (!profile.email) {
      throw new UnauthorizedException('Could not retrieve email from Google');
    }

    return this.validateOAuthUser({
      googleId: profile.sub,
      email: profile.email,
      name: profile.name || profile.email,
    });
  }

  async completeProfile(userId: string, data: any) {
    const { phone, address, dob, pan, employmentType, annualIncome } = data;
    
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        phone,
        address,
        dob: dob ? new Date(dob) : undefined,
        pan,
        employmentType,
        annualIncome: annualIncome ? parseFloat(annualIncome.toString()) : undefined,
      }
    });

    const isProfileComplete = !!(user.phone && user.pan && user.dob && user.address);
    const payload = { email: user.email, sub: user.id, isProfileComplete };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, name: user.name, employmentType: user.employmentType, isProfileComplete },
    };
  }
}
