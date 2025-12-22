import { PostRepository } from "@/server/repositories/postRepository";

export class PostsService {
    private repo = new PostRepository();

    list() {
        return this.repo.list();
    }

    get(id: string) {
        return this.repo.findById(id);
    }

    getByMemberId(memberId: string) {
        return this.repo.findByMemberId(memberId);
    }

    async create(payload: {
        member_id: string;
        content: string;
        image_data?: string;
        post_type?: string;
    }) {
        return this.repo.create({
            member: {
                connect: { id: payload.member_id }
            },
            content: payload.content,
            image_data: payload.image_data,
            post_type: payload.post_type || "post"
        });
    }

    async update(id: string, payload: any) {
        return this.repo.update(id, payload);
    }

    async delete(id: string) {
        return this.repo.delete(id);
    }

    async incrementLikes(id: string) {
        return this.repo.incrementLikes(id);
    }

    async decrementLikes(id: string) {
        return this.repo.decrementLikes(id);
    }

    async incrementReposts(id: string) {
        return this.repo.incrementReposts(id);
    }
}
