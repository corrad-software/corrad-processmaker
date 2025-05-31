import { PrismaClient } from '@prisma/client';

export default defineEventHandler(async (event) => {
  try {
    const prisma = new PrismaClient();
    
    // Get all active roles
    const roles = await prisma.role.findMany({
      where: {
        roleStatus: 'ACTIVE' // Using ACTIVE to match database convention
      },
      select: {
        roleID: true,
        roleName: true,
        roleDescription: true
      },
      orderBy: {
        roleName: 'asc'
      }
    });
    
    await prisma.$disconnect();
    
    return {
      success: true,
      roles: roles
    };
  } catch (error) {
    console.error('Error fetching roles:', error);
    
    return {
      success: false,
      error: 'Failed to fetch roles'
    };
  }
}); 