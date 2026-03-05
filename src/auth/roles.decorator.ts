import { ROLES } from '@/models/user.model';
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: typeof ROLES[number][]) => SetMetadata(ROLES_KEY, roles);

