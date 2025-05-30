import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    // Get query parameters
    const query = getQuery(event);
    const {
      page = 1,
      limit = 20,
      status,
      category,
      search,
      isTemplate,
      sortBy = 'processCreatedDate',
      sortOrder = 'desc'
    } = query;

    // Build where clause
    const where = {};
    
    // Exclude deleted processes by default unless explicitly requested
    if (query.includeDeleted !== 'true') {
      where.processStatus = { not: 'deleted' };
    }
    
    if (status && status !== 'deleted') {
      // If status filter is provided and it's not 'deleted', filter by that status
      // and still exclude deleted processes
      where.processStatus = status;
    } else if (status === 'deleted') {
      // If specifically requesting deleted processes, only show those
      where.processStatus = 'deleted';
    }
    
    if (category) {
      where.processCategory = category;
    }
    
    if (isTemplate !== undefined) {
      where.isTemplate = isTemplate === 'true';
    }
    
    if (search) {
      where.OR = [
        { processName: { contains: search, mode: 'insensitive' } },
        { processDescription: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build orderBy clause
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    // Get processes with pagination
    const [processes, totalCount] = await Promise.all([
      prisma.process.findMany({
        where,
        orderBy,
        skip,
        take,
        select: {
          processID: true,
          processUUID: true,
          processName: true,
          processDescription: true,
          processCategory: true,
          processPriority: true,
          processOwner: true,
          processVersion: true,
          processStatus: true,
          isTemplate: true,
          templateCategory: true,
          processCreatedDate: true,
          processModifiedDate: true,
          // Don't include the full definition data to keep response size small
          creator: {
            select: {
              userID: true,
              userFullName: true,
              userUsername: true
            }
          }
        }
      }),
      prisma.process.count({ where })
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / take);
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    return {
      success: true,
      data: {
        processes,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          limit: take,
          hasNextPage,
          hasPrevPage
        }
      }
    };
  } catch (error) {
    console.error('Error fetching processes:', error);
    
    return {
      success: false,
      error: 'Failed to fetch processes',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }
}); 