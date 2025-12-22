import { prisma } from "@/lib/prisma";
import type { Post, Prisma } from "@prisma/client";

export class PostRepository {
    async list(): Promise<Post[]> {
        return prisma.post.findMany({
            orderBy: { created_at: "desc" },
            include: {
                member: true
            }
        });
    }

    async findById(id: string) {
        return prisma.post.findUnique({
            where: { id },
            include: {
                member: true
            }
        });
    }

    async findByMemberId(memberId: string): Promise<Post[]> {
        return prisma.post.findMany({
            where: { member_id: memberId },
            orderBy: { created_at: "desc" }
        });
    }

    async create(data: Prisma.PostCreateInput): Promise<Post> {
        return prisma.post.create({ data });
    }

    async update(id: string, data: Prisma.PostUpdateInput): Promise<Post> {
        return prisma.post.update({ where: { id }, data });
    }

    async delete(id: string): Promise<Post> {
        return prisma.post.delete({ where: { id } });
    }

    async incrementLikes(id: string): Promise<Post> {
        return prisma.post.update({
            where: { id },
            data: {
                likes_count: {
                    increment: 1
                }
            }
        });
    }

    async decrementLikes(id: string): Promise<Post> {
        return prisma.post.update({
            where: { id },
            data: {
                likes_count: {
                    decrement: 1
                }
            }
        });
    }

    async incrementReposts(id: string): Promise<Post> {
        return prisma.post.update({
            where: { id },
            data: {
                reposts_count: {
                    increment: 1
                }
            }
        });
    }
}
