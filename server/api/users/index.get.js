import { PrismaClient } from '@prisma/client';

export default defineEventHandler(async (event) => {
  try {
    const prisma = new PrismaClient();
    
    // Get all active users
    const users = await prisma.user.findMany({
      where: {
        userStatus: 'active' // Assuming there's a status field to filter active users
      },
      select: {
        userID: true,
        userUsername: true,
        userFullName: true,
        userEmail: true
      },
      orderBy: {
        userFullName: 'asc'
      }
    });
    
    await prisma.$disconnect();
    
    return {
      success: true,
      users: users
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    
    return {
      success: false,
      error: 'Failed to fetch users'
    };
  }
}); 