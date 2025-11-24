'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import type { BusinessCategory } from '@/lib/types';
import { sendFacebookLeadEvent } from '@/lib/facebook-conversion-api';

export interface CreateLeadInput {
  name: string;
  phone: string;
  email?: string;
  category: BusinessCategory;
  businessDescription?: string;
  browser?: string;
  userAgent?: string;
  phoneModel?: string;
}

export interface CreateLeadResult {
  success: boolean;
  message?: string;
  error?: string;
  id?: string;
}

export async function createLead(data: CreateLeadInput): Promise<CreateLeadResult> {
  try {
    // Validate required fields
    if (!data.name || !data.phone || !data.category) {
      return {
        success: false,
        error: 'Missing required fields: name, phone, and category are required',
      };
    }

    // Check if there's an existing abandoned lead with the same phone or email
    const existingAbandonedLead = await prisma.lead.findFirst({
      where: {
        OR: [
          { phone: data.phone.trim() },
          ...(data.email ? [{ email: data.email.trim() }] : []),
        ],
        isAbandoned: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    let lead;

    if (existingAbandonedLead) {
      // Update the existing abandoned lead with complete information
      lead = await prisma.lead.update({
        where: { id: existingAbandonedLead.id },
        data: {
          name: data.name.trim(),
          phone: data.phone.trim(),
          email: data.email?.trim() || null,
          category: data.category,
          businessDescription: data.businessDescription?.trim() || null,
          browser: data.browser || null,
          userAgent: data.userAgent || null,
          phoneModel: data.phoneModel || null,
          status: 'NEW',
          isAbandoned: false, // Mark as completed (not abandoned)
          abandonedAt: null,
        },
      });
    } else {
      // Create new lead in database
      lead = await prisma.lead.create({
        data: {
          name: data.name.trim(),
          phone: data.phone.trim(),
          email: data.email?.trim() || null,
          category: data.category,
          businessDescription: data.businessDescription?.trim() || null,
          browser: data.browser || null,
          userAgent: data.userAgent || null,
          phoneModel: data.phoneModel || null,
          status: 'NEW',
        },
      });
    }

    // Revalidate any paths that might display leads
    revalidatePath('/');

    // Send Facebook Conversion API event (server-side)
    try {
      const pixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;
      const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
      
      if (pixelId && accessToken) {
        // Get client IP and user agent from headers
        const headersList = await headers();
        const clientIp = headersList.get('x-forwarded-for')?.split(',')[0] || 
                        headersList.get('x-real-ip') || 
                        'unknown';
        const clientUserAgent = data.userAgent || headersList.get('user-agent') || 'unknown';
        
        // Extract first and last name from full name
        const nameParts = data.name.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        // Send lead event to Facebook Conversion API
        await sendFacebookLeadEvent(
          pixelId,
          accessToken,
          {
            email: data.email?.trim(),
            phone: data.phone.trim(),
            firstName: firstName,
            lastName: lastName,
            eventId: lead.id, // Use lead ID as event ID for deduplication
            clientIpAddress: clientIp,
            clientUserAgent: clientUserAgent,
            contentName: data.category,
            contentCategory: data.category,
            value: 0, // You can set a value if you have lead values
            currency: 'USD', // Adjust currency as needed
          }
        );
      }
    } catch (error) {
      // Log error but don't fail the lead creation
      console.error('Error sending Facebook Conversion API event:', error);
    }

    return {
      success: true,
      message: 'Lead created successfully',
      id: lead.id,
    };
  } catch (error) {
    console.error('Error creating lead:', error);
    
    // Handle Prisma errors
    if (error instanceof Error) {
      return {
        success: false,
        error: `Failed to create lead: ${error.message}`,
      };
    }

    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

// Server action to get all leads with filters (for admin purposes)
export async function getLeads(filters?: {
  category?: string;
  isAbandoned?: boolean;
  status?: string;
  search?: string;
}) {
  try {
    const where: any = {};

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.isAbandoned !== undefined) {
      where.isAbandoned = filters.isAbandoned;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const leads = await prisma.lead.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      success: true,
      leads,
    };
  } catch (error) {
    console.error('Error fetching leads:', error);
    return {
      success: false,
      error: 'Failed to fetch leads',
      leads: [],
    };
  }
}

// Server action to get lead statistics
export async function getLeadStats() {
  try {
    const [
      totalLeads,
      abandonedLeads,
      leadsByCategory,
      leadsByBrowser,
      recentLeads,
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { isAbandoned: true } }),
      prisma.lead.groupBy({
        by: ['category'],
        _count: true,
      }),
      prisma.lead.groupBy({
        by: ['browser'],
        _count: true,
        where: {
          browser: { not: null },
        },
      }),
      prisma.lead.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          createdAt: true,
        },
      }),
    ]);

    // Calculate leads by time (today, this week, this month)
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today);
    thisWeek.setDate(today.getDate() - 7);
    const thisMonth = new Date(today);
    thisMonth.setMonth(today.getMonth() - 1);

    const [leadsToday, leadsThisWeek, leadsThisMonth] = await Promise.all([
      prisma.lead.count({
        where: { createdAt: { gte: today } },
      }),
      prisma.lead.count({
        where: { createdAt: { gte: thisWeek } },
      }),
      prisma.lead.count({
        where: { createdAt: { gte: thisMonth } },
      }),
    ]);

    return {
      success: true,
      stats: {
        total: totalLeads,
        abandoned: abandonedLeads,
        active: totalLeads - abandonedLeads,
        byCategory: leadsByCategory.map((item) => ({
          category: item.category,
          count: item._count,
        })),
        byBrowser: leadsByBrowser.map((item) => ({
          browser: item.browser || 'Unknown',
          count: item._count,
        })),
        byTime: {
          today: leadsToday,
          thisWeek: leadsThisWeek,
          thisMonth: leadsThisMonth,
        },
      },
    };
  } catch (error) {
    console.error('Error fetching lead stats:', error);
    return {
      success: false,
      error: 'Failed to fetch lead statistics',
      stats: null,
    };
  }
}

// Server action to mark lead as abandoned
export async function markLeadAbandoned(leadId: string) {
  try {
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        isAbandoned: true,
        abandonedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error marking lead as abandoned:', error);
    return {
      success: false,
      error: 'Failed to mark lead as abandoned',
    };
  }
}

// Server action to unmark lead as abandoned
export async function unmarkLeadAbandoned(leadId: string) {
  try {
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        isAbandoned: false,
        abandonedAt: null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error unmarking lead as abandoned:', error);
    return {
      success: false,
      error: 'Failed to unmark lead as abandoned',
    };
  }
}

// Server action to update lead status
export async function updateLeadStatus(leadId: string, status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'ABANDONED') {
  try {
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        status,
        // Auto-update isAbandoned based on status
        isAbandoned: status === 'ABANDONED',
        abandonedAt: status === 'ABANDONED' ? new Date() : null,
      },
    });

    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error('Error updating lead status:', error);
    return {
      success: false,
      error: 'Failed to update lead status',
    };
  }
}

// Server action to bulk delete leads
export async function bulkDeleteLeads(leadIds: string[]) {
  try {
    if (!leadIds || leadIds.length === 0) {
      return {
        success: false,
        error: 'No leads selected for deletion',
      };
    }

    const result = await prisma.lead.deleteMany({
      where: {
        id: {
          in: leadIds,
        },
      },
    });

    revalidatePath('/admin');
    return {
      success: true,
      deletedCount: result.count,
    };
  } catch (error) {
    console.error('Error bulk deleting leads:', error);
    return {
      success: false,
      error: 'Failed to delete leads',
    };
  }
}

// Server action to create an abandoned lead (saves partial data silently)
export interface CreateAbandonedLeadInput {
  name?: string;
  phone?: string;
  email?: string;
  category?: BusinessCategory;
  businessDescription?: string;
  browser?: string;
  userAgent?: string;
  phoneModel?: string;
}

export async function createAbandonedLead(data: CreateAbandonedLeadInput): Promise<CreateLeadResult> {
  try {
    // Validate that we have phone number (required for abandoned leads)
    if (!data.phone) {
      return {
        success: false,
        error: 'Phone number is required for abandoned leads',
      };
    }

    // Check if a lead with the same phone already exists (to avoid duplicates)
    const existingLead = await prisma.lead.findFirst({
      where: {
        phone: data.phone.trim(),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // If lead exists and was just created (within last 5 minutes), don't create duplicate
    if (existingLead) {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      if (existingLead.createdAt > fiveMinutesAgo) {
        // Update existing lead to mark as abandoned if not already
        if (!existingLead.isAbandoned) {
          await prisma.lead.update({
            where: { id: existingLead.id },
            data: {
              status: 'ABANDONED',
              isAbandoned: true,
              abandonedAt: new Date(),
              // Update with any new data
              ...(data.name && { name: data.name.trim() }),
              ...(data.phone && { phone: data.phone.trim() }),
              ...(data.email && { email: data.email.trim() }),
              ...(data.category && { category: data.category }),
              ...(data.businessDescription && { businessDescription: data.businessDescription.trim() }),
              ...(data.phoneModel && { phoneModel: data.phoneModel }),
            },
          });
        }
        return {
          success: true,
          message: 'Abandoned lead updated',
          id: existingLead.id,
        };
      }
    }

    // Create abandoned lead with placeholder values for required fields if missing
    const lead = await prisma.lead.create({
      data: {
        name: data.name?.trim() || 'Not provided',
        phone: data.phone.trim(), // Phone is required, so no fallback needed
        email: data.email?.trim() || null,
        category: data.category || 'other',
        businessDescription: data.businessDescription?.trim() || null,
        browser: data.browser || null,
        userAgent: data.userAgent || null,
        phoneModel: data.phoneModel || null,
        status: 'ABANDONED',
        isAbandoned: true,
        abandonedAt: new Date(),
      },
    });

    return {
      success: true,
      message: 'Abandoned lead created successfully',
      id: lead.id,
    };
  } catch (error) {
    console.error('Error creating abandoned lead:', error);
    
    // Silently fail - don't expose errors to user for abandoned leads
    return {
      success: false,
      error: 'Failed to create abandoned lead',
    };
  }
}

