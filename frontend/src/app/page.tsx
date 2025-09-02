import MainLayout from '@/components/layout/MainLayout';
import PostComposer from '@/components/posts/PostComposer';
import PostCard from '@/components/posts/PostCard';

// Mock data for demonstration
const mockPosts = [
  {
    id: '1',
    author: {
      name: 'John Doe',
      username: 'johndoe',
      avatar: '/api/placeholder/40/40',
    },
    content: 'Just launched my new startup! Excited to share this journey with everyone. 🚀',
    timestamp: '2h',
    likes: 42,
    comments: 8,
    reposts: 5,
    isLiked: false,
    isReposted: false,
  },
  {
    id: '2',
    author: {
      name: 'Jane Smith',
      username: 'janesmith',
      avatar: '/api/placeholder/40/40',
    },
    content: 'Beautiful sunset today! Sometimes you just need to stop and appreciate the little things in life. 🌅',
    timestamp: '4h',
    likes: 28,
    comments: 3,
    reposts: 2,
    isLiked: true,
    isReposted: false,
  },
  {
    id: '3',
    author: {
      name: 'Mike Johnson',
      username: 'mikej',
      avatar: '/api/placeholder/40/40',
    },
    content: 'Working on some exciting new features for our app. Can\'t wait to show you what we\'ve been building! 💻',
    timestamp: '6h',
    likes: 15,
    comments: 7,
    reposts: 1,
    isLiked: false,
    isReposted: true,
  },
];

export default function Home() {
  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Post Composer */}
        <PostComposer />

        {/* Feed */}
        <div className="space-y-4">
          {mockPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
