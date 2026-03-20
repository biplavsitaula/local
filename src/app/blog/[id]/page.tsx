import { Metadata } from "next";
import BlogDetailPageContent from "@/components/pages/BlogDetailPageContent";
import { Providers } from "@/components/Providers";
import { blogService } from "@/services/blog.service";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { id } = params;
  try {
    const response = await blogService.getById(id);
    const blog = response.data;
    
    return {
      title: `${blog.title} | Mixology Blog`,
      description: `Learn how to make ${blog.title}. Ingredients: ${blog.ingredients.join(", ")}.`,
      openGraph: {
        title: blog.title,
        description: `Learn how to make ${blog.title}.`,
        images: [blog.image || ""],
      },
    };
  } catch (error) {
    return {
      title: "Blog Not Found | Flame Beverage",
    };
  }
}

export default function BlogDetailPage() {
  return (
    <Providers>
      <BlogDetailPageContent />
    </Providers>
  );
}
