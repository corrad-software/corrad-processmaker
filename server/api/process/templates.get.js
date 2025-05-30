import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    // Get query parameters
    const query = getQuery(event);
    const {
      category,
      search,
      sortBy = 'processCreatedDate',
      sortOrder = 'desc'
    } = query;

    // Build where clause for templates
    const where = {
      isTemplate: true
    };
    
    if (category) {
      where.templateCategory = category;
    }
    
    if (search) {
      where.OR = [
        { processName: { contains: search, mode: 'insensitive' } },
        { processDescription: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Build orderBy clause
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    // Get templates
    const templates = await prisma.process.findMany({
      where,
      orderBy,
      select: {
        processID: true,
        processUUID: true,
        processName: true,
        processDescription: true,
        processCategory: true,
        templateCategory: true,
        processDefinition: true,
        processVariables: true,
        processSettings: true,
        processCreatedDate: true,
        processModifiedDate: true,
        creator: {
          select: {
            userID: true,
            userFullName: true,
            userUsername: true
          }
        }
      }
    });

    // Get template categories for filtering
    const categories = await prisma.process.findMany({
      where: {
        isTemplate: true,
        templateCategory: { not: null }
      },
      select: {
        templateCategory: true
      },
      distinct: ['templateCategory']
    });

    const uniqueCategories = categories
      .map(c => c.templateCategory)
      .filter(Boolean)
      .sort();

    return {
      success: true,
      data: {
        templates,
        categories: uniqueCategories
      }
    };
  } catch (error) {
    console.error('Error fetching process templates:', error);
    
    return {
      success: false,
      error: 'Failed to fetch process templates',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }
}); 